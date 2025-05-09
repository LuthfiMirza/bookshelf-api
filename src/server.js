const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  let books = [];

  // Add Book
  server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      const {
        name, year, author, summary, publisher, pageCount, readPage, reading,
      } = request.payload;

      // Validation
      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      // Create book
      const id = nanoid(16);
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;
      const finished = pageCount === readPage;

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };

      books.push(newBook);

      return h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: { bookId: id },
      }).code(201);
    },
  });

  // Get All Books
  server.route({
    method: 'GET',
    path: '/books',
    handler: (request) => {
      let filteredBooks = [...books];

      // Query filters
      const { name, reading, finished } = request.query;

      if (name) {
        const searchName = name.toLowerCase();
        filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(searchName));
      }

      if (reading !== undefined) {
        filteredBooks = filteredBooks.filter(
          (book) => book.reading === (reading === '1'),
        );
      }

      if (finished !== undefined) {
        filteredBooks = filteredBooks.filter(
          (book) => book.finished === (finished === '1'),
        );
      }

      // Response structure
      const responseBooks = filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));

      return {
        status: 'success',
        data: { books: responseBooks },
      };
    },
  });

  // Get Book Detail
  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const book = books.find((b) => b.id === bookId);

      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan',
        }).code(404);
      }

      return {
        status: 'success',
        data: { book },
      };
    },
  });

  // Update Book
  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const {
        name, year, author, summary, publisher, pageCount, readPage, reading,
      } = request.payload;

      // Validation
      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      // Find book
      const index = books.findIndex((b) => b.id === bookId);
      if (index === -1) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
      }

      // Update book
      const updatedAt = new Date().toISOString();
      const finished = pageCount === readPage;

      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        updatedAt,
      };

      return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });
    },
  });

  // Delete Book
  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h.response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
      }

      books.splice(index, 1);
      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      });
    },
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();