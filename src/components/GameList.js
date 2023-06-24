import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [availableGenres, setAvailableGenres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6); // jogos exibidos por página, aumente se desejar mostrar mais em cada seção
  const [maxVisiblePages] = useState(5); // máximo de páginas visíveis

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const timeout = setTimeout(() => {
          setError(true);
        }, 5000);

        const response = await axios.get(
          'https://games-test-api-81e9fb0d564a.herokuapp.com/api/data',
          {
            headers: {
              'dev-email-address': 'fernandohsilva10@hotmail.com',
            },
          }
        );

        clearTimeout(timeout);
        setGames(response.data);
        setIsLoading(false);

        const genres = response.data.map((game) => game.genre);
        const uniqueGenres = [...new Set(genres)];
        setAvailableGenres(uniqueGenres);
      } catch (error) {
        console.error(error);
        setError(true);
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // reset da página atual
  };

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
    setCurrentPage(1); // reset da página atual se selecionado um gênero
  };

  const filteredGames = games.filter(
    (game) =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGenre === '' || game.genre === selectedGenre)
  );

  const totalPages = Math.ceil(filteredGames.length / perPage); // cálculo do número total de páginas

  // cálculo do índice final e inicial
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  // mostra os jogos a serem exibidos na página atual
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // função para ir para a página anterior
  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  // função para ir para a próxima página
  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // função para ir para uma página específica
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // cálculo do intervalo de páginas a serem exibidas na paginação
  const getPageRange = () => {
    const totalVisiblePages = Math.min(maxVisiblePages, totalPages);
    const halfVisiblePages = Math.floor(totalVisiblePages / 2);
    let startPage = currentPage - halfVisiblePages;
    let endPage = currentPage + halfVisiblePages;

    if (startPage <= 0) {
      startPage = 1;
      endPage = totalVisiblePages;
    }

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - totalVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  return (
    <div className="container">
      <h1>Escolha seu jogo favorito</h1>
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Pesquisar por título"
          className="search-input"
        />
        <div className="filter">
          <select
            id="genre-select"
            value={selectedGenre}
            onChange={handleGenreChange}
            className="genre-select"
          >
            <option value="">Gênero</option>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isLoading && <p className="loading-message">Carregando...</p>}
      {!isLoading && error && (
        <p className="error-message">
          {error === 'timeout'
            ? 'O servidor demorou para responder. Tente mais tarde.'
            : 'O servidor está instável. Tente recarregar a página.'}
        </p>
      )}
      {!isLoading && !error && (
        <div>
          <div className="game-list">
            {currentGames.map((game) => (
              <div className="game-card" key={game.id}>
                <img src={game.thumbnail} alt={game.title} />
                <h2>{game.title}</h2>
                <p>Gênero: {game.genre}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={goToPreviousPage}>
              Anterior
            </button>
            {getPageRange().map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={goToNextPage}>
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameList;

