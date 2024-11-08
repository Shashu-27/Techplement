const express = require('express');
const Quote = require('../models/Quote');
const router = express.Router();

// Get a random quote
router.get('/random', async (req, res) => {
  try {
    // Get a random document from the quotes collection
    const randomDoc = await Quote.aggregate([{ $sample: { size: 1 } }]);

    if (randomDoc.length > 0) {
      // Now we fetch a random quote from the 'quotes' array inside the document
      const randomQuote = randomDoc[0].quotes[Math.floor(Math.random() * randomDoc[0].quotes.length)];

      return res.json({
        quote: randomQuote.quote,
        author: randomQuote.author
      });
    }

    res.status(404).json({ message: 'No quotes found.' });
  } catch (err) {
    console.error('Error retrieving random quote:', err);
    res.status(500).json({ message: err.message });
  }
});


// Search quotes by author
router.get('/search', async (req, res) => {
  const author = req.query.author;

  if (!author) {
    return res.status(400).json({ message: 'Author name is required.' });
  }

  try {
    // Searching inside the quotes array for the author
    const quotes = await Quote.aggregate([
      { $unwind: "$quotes" },  // Unwind the quotes array to treat each quote as a separate document
      { 
        $match: { 
          "quotes.author": { 
            $regex: author, 
            $options: 'i' // Case-insensitive search
          } 
        } 
      },
      { 
        $project: { 
          _id: 0, 
          quote: "$quotes.quote", 
          author: "$quotes.author" 
        } 
      }
    ]);

    // If no quotes found, return appropriate message
    if (quotes.length > 0) {
      return res.json(quotes);
    }

    res.status(404).json({ message: 'No quotes found for this author.' });
  } catch (err) {
    console.error('Error searching quotes:', err);
    res.status(500).json({ message: 'Error searching quotes. Please try again later.' });
  }
});
router.post('/add', async (req, res) => {
  const { author, quote } = req.body;

  if (!author || !quote) {
    return res.status(400).json({ message: 'Both quote and author are required.' });
  }

  try {
    let quoteDoc = await Quote.findOne();
    
    if (!quoteDoc) {
      // If no document exists, create one
      quoteDoc = new Quote({ quotes: [] });
    }

    quoteDoc.quotes.push({ quote, author });
    await quoteDoc.save();

    res.status(200).json({
      message: 'Quote added successfully!',
      quote: { quote, author },
    });
  } catch (err) {
    console.error('Error adding quote:', err);
    res.status(500).json({ message: 'Error adding quote. Please try again.' });
  }
});


router.put('/update-quote', async (req, res) => {
  const { quote, author, newQuote, newAuthor } = req.body;

  if (!quote || !author || !newQuote || !newAuthor) {
    return res.status(400).json({ message: 'Quote, author, newQuote, and newAuthor are required to update.' });
  }
  console.log('Received data:', { quote, author, newQuote, newAuthor });

  try {
    // Find the document containing the quote and author
    const quoteDoc = await Quote.findOne({
      'quotes.quote': quote,
      'quotes.author': author
    });

    if (!quoteDoc) {
      console.log('Document not found.');
      return res.status(404).json({ message: 'Document not found.' });
    }

    console.log('Found quote document:', quoteDoc);

    // Find the index of the quote inside the quotes array
    const quoteIndex = quoteDoc.quotes.findIndex(q => q.quote === quote && q.author === author);

    if (quoteIndex === -1) {
      console.log('Quote not found in the document.');
      return res.status(404).json({ message: 'Quote not found in the document.' });
    }

    console.log('Quote index found:', quoteIndex);

    // Update the quote and author in the array at the found index
    quoteDoc.quotes[quoteIndex] = { quote: newQuote, author: newAuthor };

    // Save the updated document
    const savedDoc = await quoteDoc.save();
    console.log('Saved updated document:', savedDoc);

    res.json({ message: 'Quote updated successfully.' });
  } catch (err) {
    console.error('Error updating quote:', err);
    res.status(500).json({ message: 'Failed to update quote. Please try again.' });
  }
});



// Delete a quote by id
router.delete('/delete-quote', async (req, res) => {
  const { quote, author } = req.body; // You can identify the quote by its content

  try {
    // Find the first document (or specify criteria if needed)
    const quoteDoc = await Quote.findOne();

    if (!quoteDoc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Find the index of the quote to be deleted based on quote text or author
    const quoteIndex = quoteDoc.quotes.findIndex(q => q.quote === quote && q.author === author);

    if (quoteIndex === -1) {
      return res.status(404).json({ message: 'Quote not found in the document.' });
    }

    // Remove the quote from the quotes array
    quoteDoc.quotes.splice(quoteIndex, 1);

    // Save the updated document
    await quoteDoc.save();

    res.json({ message: 'Quote deleted successfully.' });
  } catch (err) {
    console.error('Error deleting quote:', err);
    res.status(500).json({ message: 'Error deleting quote. Please try again later.' });
  }
});


module.exports = router;
