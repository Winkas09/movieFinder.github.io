const movieResults = document.querySelector("#movie-results");
const movieForm = document.querySelector("#movie-form");
const paginationControls = document.querySelector("#pagination-controls");
const loadingIndicator = document.createElement("div");
const submitButton = movieForm.querySelector("button[type='submit']");

loadingIndicator.id = "loading-indicator";
loadingIndicator.innerHTML = "Loading...";
loadingIndicator.style.display = "none";
document.body.appendChild(loadingIndicator);

let currentPage = 1;
const moviesPerPage = 10;
let filteredMovies = [];

movieForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = document.querySelector("#query-input").value.trim();
  const genre = document.querySelector("#genre").value.toLowerCase();

  if (!query && !genre) {
    movieResults.innerHTML = `<h2>Please enter a search query or select a genre.</h2>`;
    return;
  }

  const searchQuery = query || "movie";

  let allMovies = [];
  let page = 1;
  let totalResults = 0;

  // Show loading indicator and disable submit button
  loadingIndicator.style.display = "block";
  submitButton.disabled = true;

  try {
    do {
      const searchURL = `https://www.omdbapi.com/?apikey=683ee54d&s=${encodeURIComponent(searchQuery)}&page=${page}`;
      console.log(`Fetching URL: ${searchURL}`);
      const response = await fetch(searchURL);
      const data = await response.json();
      console.log(`Response data:`, data);
      a;
      if (data.Response === "True") {
        totalResults = parseInt(data.totalResults);
        allMovies = allMovies.concat(data.Search);
        page++;
      } else {
        break;
      }
    } while (allMovies.length < totalResults && allMovies.length < 200); // limitas 200 filmu per paieska, nes ilgai kraunasi paskui

    const detailedMovies = await Promise.all(
      allMovies.map(async (movie) => {
        const detailedResponse = await fetch(`https://www.omdbapi.com/?apikey=683ee54d&i=${movie.imdbID}`);
        return detailedResponse.json();
      })
    );

    // filtruojam pagal genre, jei pasirinktas genre ne "all"
    filteredMovies = genre && genre !== "all" ? detailedMovies.filter((movie) => movie.Genre.toLowerCase().includes(genre)) : detailedMovies;

    if (filteredMovies.length > 0) {
      currentPage = 1;
      displayMovies(filteredMovies, currentPage);
      setupPagination(filteredMovies);
    } else {
      movieResults.innerHTML = `<h2>No movies found</h2>`;
    }
  } catch (error) {
    console.error("Error fetching movies", error);
    movieResults.innerHTML = `<h2>An error occurred. Please try again later.</h2>`;
  } finally {
    // isjungti hide loading indicator and enable submit button
    loadingIndicator.style.display = "none";
    submitButton.disabled = false;
  }
});

function displayMovies(movies, page) {
  const startIndex = (page - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const moviesToDisplay = movies.slice(startIndex, endIndex);

  if (moviesToDisplay.length === 0) {
    movieResults.innerHTML = `<h2>No movies found for the selected genre.</h2>`;
    return;
  }

  movieResults.innerHTML = moviesToDisplay
    .map(
      (movie) => `
        <div class="movie">
        <h2>${movie.Title} (${movie.Year})</h2>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Actors:</strong> ${movie.Actors}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
        <img src="${movie.Poster}" alt="${movie.Title} poster">
        </div> 
        `
    )
    .join("");
}

function setupPagination(movies) {
  const totalPages = Math.ceil(movies.length / moviesPerPage);
  paginationControls.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.addEventListener("click", () => {
      currentPage = i;
      displayMovies(movies, currentPage);
    });
    paginationControls.appendChild(pageButton);
  }
}
