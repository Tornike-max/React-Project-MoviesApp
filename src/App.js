import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, _, arr) => acc + cur / arr.length, 0);

function App() {
  return (
    <div className="App">
      <Main />
    </div>
  );
}

const KEY = "7a9994b1";

function Main() {
  const [query, setQuery] = useState("");
  const [movieArr, setMovieArr] = useState([]);
  const [watchedArr, setWatchedArr] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const moviesCount = movieArr?.length;

  function handleSelection(id) {
    setSelected(selected === id ? null : id);
  }

  function addInWatchedList(movObj) {
    setWatchedArr((watched) => [...watched, movObj]);
  }

  function removeInWatchedlist(id) {
    setWatchedArr((watched) => watched.filter((curId) => curId.imdbID !== id));
  }

  useEffect(() => {
    const controller = new AbortController();
    async function fetchApi() {
      try {
        setError("");
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("error💥");
        const data = await res.json();
        if (data.Response === "False") throw new Error("Response error💥💥");

        if (query.length > 3) {
        }
        setIsLoading(false);
        setMovieArr(data.Search);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchApi();

    return () => {
      controller.abort();
    };
  }, [query]);
  return (
    <div>
      <Navbar query={query} setQuery={setQuery} moviesCount={moviesCount} />
      <MainBox>
        {isLoading && query ? (
          <Loader />
        ) : (
          <MoviesList>
            {movieArr && (
              <Movie
                movieArr={movieArr}
                setSelected={setSelected}
                selected={selected}
                handleSelection={handleSelection}
              />
            )}
          </MoviesList>
        )}
        <WatchedMovies selected={selected}>
          {!selected && (
            <WatchedSummary
              selectedMov={selectedMovie}
              watchedArr={watchedArr}
              removeInWatchedlist={removeInWatchedlist}
              setWatchedArr={setWatchedArr}
            />
          )}
          {selected && (
            <WatchedBox
              selected={selected}
              setWatchedArr={setWatchedArr}
              watchedArr={watchedArr}
              setSelected={setSelected}
              setSelectedMovie={setSelectedMovie}
              addInWatchedList={addInWatchedList}
            />
          )}
        </WatchedMovies>
      </MainBox>
    </div>
  );
}

function Error(msg) {
  return (
    <span>
      💥<p>{msg}</p>
    </span>
  );
}

function Loader() {
  return (
    <span className="loading">
      <p>Loading...</p>
    </span>
  );
}

function Navbar({ query, setQuery, moviesCount }) {
  return (
    <div className="navigation">
      <h3>OzbetaNet</h3>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="Search"
      />
      <p>Found {moviesCount} results</p>
    </div>
  );
}

function MainBox({ children }) {
  return <div className="main-box">{children}</div>;
}

function MoviesList({ children }) {
  return <div className="movie-list">{children}</div>;
}

function Movie({ movieArr, selected, handleSelection }) {
  function selection(id) {
    handleSelection(id);
  }
  return (
    <>
      {movieArr.map((mov) => (
        <div
          style={
            selected === mov.imdbID ? { backgroundColor: "slateblue" } : {}
          }
          className="movie"
        >
          <img src={mov.Poster} alt="..." />
          <div className="inside-of-list">
            <h3>{mov.Title}</h3>
            <p>🗓️Year: {mov.Year}</p>
            <p>🌀Type: {mov.Type}</p>
            <button
              onClick={() => selection(mov.imdbID)}
              className="btn-select"
            >
              {selected === mov.imdbID ? "Close" : "Select"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function WatchedMovies({ children }) {
  return <div className="watched-list">{children}</div>;
}

function WatchedBox({
  selected,
  setSelected,
  setSelectedMovie,
  addInWatchedList,
  watchedArr,
}) {
  const [movies, setMovie] = useState([]);
  const [onRating, SetOnRating] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isWatched = watchedArr.map((mov) => mov.imdbID).includes(selected);

  const isRatedRating = watchedArr.find(
    (mov) => mov.imdbID === selected
  )?.onRating;

  const {
    Actors: actors,
    Poster: poster,
    Released: released,
    Runtime: runtime,
    Title: title,
    imdbRating,
    Genre: genre,
    Director: director,
    Plot: plot,
    Country: country,
  } = movies;

  function checkIsOpen(movies) {
    const newObj = {
      imdbID: selected,
      actors,
      poster,
      released,
      runtime: Number(runtime.split(" ").at(0)),
      title,
      imdbRating: Number(imdbRating),
      genre,
      director,
      plot,
      country,
      onRating,
    };

    setSelectedMovie(movies);
    addInWatchedList(newObj);
    setSelected(null);
  }

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selected}`
        );
        if (!res.ok) throw new Error("wrong id💥");
        const data = await res.json();
        if (data.Response === "False") throw new Error("wrong Response💥");
        setIsLoading(false);
        setMovie(data);
      } catch (err) {
        console.error(err);
      }
    }
    getMovieDetails();
  }, [selected]);

  useEffect(() => {
    if (!title) return;
    document.title = title;
    return () => (document.title = "OzbetaNet");
  }, [title]);
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="cards">
          <button onClick={() => checkIsOpen()} className="btn-toggle">
            &larr;
          </button>
          <div className="img-div">
            <h5>{title}</h5>
            <img src={poster} alt={title} />
          </div>
          <div className="details">
            {!isWatched ? (
              <div className="adding-div">
                <StarRating
                  size={24}
                  maxRating={10}
                  onSetRating={SetOnRating}
                />
                {onRating && (
                  <button
                    onClick={() => checkIsOpen(movies)}
                    className="btn-add-list"
                  >
                    Add To List
                  </button>
                )}
              </div>
            ) : (
              <div className="adding-div">
                <p>You have already rated this movie with {isRatedRating}🌟</p>
              </div>
            )}

            <p>🌟IMDB: {imdbRating}</p>
            <p>🗓️Release Date: {released}</p>
            <p>🏴Country: {country}</p>
            <p>🎥Directed By {director}</p>
            <p>🎭Actors: {actors}</p>
            <p>{plot}</p>
          </div>
        </div>
      )}
    </>
  );
}

function WatchedSummary({ watchedArr, removeInWatchedlist, setWatchedArr }) {
  const averageOfImdb = average(
    watchedArr.map((movie) => parseFloat(movie?.imdbRating))
  );

  const averageOfRunTime = average(
    watchedArr.map((movie) => parseFloat(movie?.runtime))
  );

  const averageOfStars = average(
    watchedArr.map((movie) => parseFloat(movie?.onRating))
  );

  return (
    <>
      <div className="watched-summary">
        <div className="watched-title">
          <h4>Movies You Watched</h4>
        </div>
        <div className="ratings">
          <p>🎭 {watchedArr.length} Movies</p>
          <p>🌟IMDB {averageOfImdb.toFixed(1)}</p>
          <p>💫 {averageOfStars}</p>
          <p>⌛ {averageOfRunTime.toFixed(2)} min</p>
        </div>
      </div>
      <WatchedInList
        watchedArr={watchedArr}
        removeInWatchedlist={removeInWatchedlist}
        setWatchedArr={setWatchedArr}
      />
    </>
  );
}

function WatchedInList({ watchedArr, removeInWatchedlist }) {
  function remove(id) {
    removeInWatchedlist(id);
  }

  return (
    <ul className="mov-ul">
      {watchedArr.map((movie) =>
        movie ? (
          <>
            <li className="mov-li">
              <img src={movie.poster} alt={movie.title} />
              <div className="parent-div">
                <div className="mov-li-div">
                  <h5>{movie.title}</h5>
                </div>
                <div className="child-div">
                  <p>💫 {movie.imdbRating}</p>
                  <p>🌟 {movie.onRating}</p>
                  <p>⌛ {movie.runtime} min</p>
                  <button
                    style={{ border: "1px solid slateblue" }}
                    onClick={() => remove(movie.imdbID)}
                  >
                    &#10005;
                  </button>
                </div>
              </div>
            </li>
          </>
        ) : (
          ""
        )
      )}
    </ul>
  );
}

export default App;
