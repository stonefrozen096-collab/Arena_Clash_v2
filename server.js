// ============================================================
//  ARENA CLASH — SERVER.JS
//  Simple Express static server + optional Socket.io multiplayer
//  Run: node server.js
//  Then open: http://localhost:3000
// ============================================================

const express = require('express');
const http    = require('http');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;

// ── STATIC FILES ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── CATCH-ALL → serve index.html ──────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── START ──────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log('  ║        ARENA CLASH SERVER             ║');
  console.log('  ╠═══════════════════════════════════════╣');
  console.log(`  ║  Local:   http://localhost:${PORT}        ║`);
  console.log('  ║                                       ║');
  console.log('  ║  Open in browser and play!            ║');
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');
});

// ── OPTIONAL: Socket.io multiplayer stub ──────────────────────
// Uncomment below to enable real-time multiplayer rooms
// (install: npm install socket.io)
//
// const { Server } = require('socket.io');
// const io = new Server(server);
// const rooms = {};
//
// io.on('connection', (socket) => {
//   console.log('Player connected:', socket.id);
//
//   socket.on('join_room', ({ roomId, hero, playerName }) => {
//     socket.join(roomId);
//     if (!rooms[roomId]) rooms[roomId] = { players: [] };
//     rooms[roomId].players.push({ id: socket.id, hero, playerName });
//     io.to(roomId).emit('room_update', rooms[roomId]);
//     if (rooms[roomId].players.length >= 2) {
//       io.to(roomId).emit('match_start', rooms[roomId]);
//     }
//   });
//
//   socket.on('game_action', ({ roomId, action }) => {
//     socket.to(roomId).emit('opponent_action', action);
//   });
//
//   socket.on('disconnect', () => {
//     Object.keys(rooms).forEach(rid => {
//       rooms[rid].players = rooms[rid].players.filter(p => p.id !== socket.id);
//       io.to(rid).emit('room_update', rooms[rid]);
//     });
//   });
// });
