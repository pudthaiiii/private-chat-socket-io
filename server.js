const app = require('express')(),
	http = require('http').Server(app),
	path = require('path')
	io = require('socket.io')(http);

// 
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'))
})

let users = [];
io.on('connection', (socket) => {
	// join room
	socket.on('join:room', (data) => {
		socket.join(data.room)
		socket.room = data.room
		socket.nickname = data.nickname
		// save users
		users.push({
			room: data.room,
			name: data.nickname
		})
		
		io.to(socket.room).emit('join:room', users.filter((user) => user.room == data.room))
	})

	// disconnect
	socket.on('disconnect', () => {
		const index = users.findIndex((user) => user.name == socket.nickname)
		if (index !== -1) {
			users.splice(index, 1)
			io.to(socket.room).emit('join:room', users.filter((user) => user.room == socket.room))
		}
	})

	// message send
	socket.on('message:send', (message) => {
		if (message) {
			io.to(socket.room).emit('message:read', { 
				nickname: socket.nickname, 
				message: message 
			})
		}
	})

})





http.listen(5000, () => console.log('Run http://localhost:5000'))
