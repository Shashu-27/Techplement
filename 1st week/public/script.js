document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = 'http://localhost:5000/api/quotes';

  // Function to get a random quote
  async function getRandomQuote() {
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorElement = document.getElementById('quote-author');
  
    try {
      const response = await axios.get(`${apiUrl}/random`);
      const quote = response.data;

      // Update the UI with the random quote and author
      quoteTextElement.textContent = quote.quote;
      quoteAuthorElement.textContent = `— ${quote.author}`;
    } catch (error) {
      console.error('Error fetching the quote:', error);
      quoteTextElement.textContent = 'Error fetching quote, please try again.';
      quoteAuthorElement.textContent = '';
    }
  }

  // Function to search quotes by author
  async function searchByAuthor() {
    const author = document.getElementById('author-search').value;
    const searchResultsElement = document.getElementById('search-results');
  
    try {
      const response = await axios.get(`${apiUrl}/search?author=${encodeURIComponent(author)}`);
      const results = response.data;

      searchResultsElement.innerHTML = '';  // Clear previous results

      // Display the results
      results.forEach(quote => {
        const quoteElement = document.createElement('p');
        quoteElement.textContent = `${quote.quote} — ${quote.author}`;
        searchResultsElement.appendChild(quoteElement);
      });
    } catch (error) {
      searchResultsElement.textContent = 'No quotes found for this author.';
    }
  }

  // Function to add a new quote
  async function addQuote() {
    const quote = prompt("Enter the quote text:");
    const author = prompt("Enter the author name:");
  
    if (!quote || !author) {
      alert("Quote and author are required.");
      return;
    }
  
    try {
      const response = await axios.post(`${apiUrl}/add`, { quote, author });
      alert(response.data.message);  // Show success message from backend
  
      // Optionally, refresh quotes or update UI to show the new quote added
      await fetchAndDisplayQuotes();  // This should call your function to refresh quotes in UI
    } catch (error) {
      console.error('Error adding the quote:', error);
      alert('Failed to add quote. Please try again.');
    }
  }
  

  // Function to update an existing quote
  async function updateQuote() {
    const quote = prompt("Enter the quote text you want to update:");
    const author = prompt("Enter the author name of the quote to update:");
    const newQuote = prompt("Enter the new quote text:");
    const newAuthor = prompt("Enter the new author name:");
  
    if (!quote || !author || !newQuote || !newAuthor) return alert("Quote, author, new quote, and new author are required.");
  
    try {
      const response = await axios.put(`${apiUrl}/update-quote`, { quote, author, newQuote, newAuthor });
      alert(response.data.message);  // Success message
    } catch (error) {
      console.error('Error updating the quote:', error);
      alert('Failed to update quote. Please try again.');
    }
  }
  
  // Function to delete a quote by ID
  async function deleteQuote() {
    const quote = prompt("Enter the quote text you want to delete:");
    const author = prompt("Enter the author name of the quote to delete:");

    if (!quote || !author) return alert("Quote and author are required.");

    try {
      const response = await axios.delete(`${apiUrl}/delete-quote`, {
        data: { quote, author },
      });
      alert(response.data.message);  // Success message
    } catch (error) {
      console.error('Error deleting the quote:', error);
      alert('Failed to delete quote. Please try again.');
    }
  }

  // Event listeners for the buttons
  document.getElementById('getQuoteButton').addEventListener('click', getRandomQuote);
  document.getElementById('searchButton').addEventListener('click', searchByAuthor);
  document.getElementById('addQuoteButton').addEventListener('click', addQuote);
  document.getElementById('updateQuoteButton').addEventListener('click', updateQuote);
  document.getElementById('deleteQuoteButton').addEventListener('click', deleteQuote);
});
