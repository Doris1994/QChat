//引入http模块
var http = require('http'),
	//引入express模块，express是node.js中管理路由响应请求的模块，根据请求的URL返回相应的HTML页面
	express = require('express'),
    app = express(),
    //创建一个服务器
    // server = http.createServer(function(req, res) {
    //     res.writeHead(200, {
    //         'Conten,-Type': 'text/plain'
    //     });
    //     res.write('hello world!');
    //     res.end();
    // });
    server = http.createServer(app),
	io = require('socket.io').listen(server),//引入socket.io模块并绑定到服务器
	users=[];//保存所有在线用户的昵称

app.use('/', express.static(__dirname + '/www'));//指定静态HTML文件的位置styly
//监听8024端口
server.listen(8024);
console.log('server started');

//socket部分
//io表示服务器整个socket连接
//参数：socket表示的是当前连接到服务器的那个客户端
io.on('connection', function(socket) {
    //接收并处理客户端发送的foo事件
    socket.on('foo', function(data) {
        //将消息输出到控制台
        console.log(data);
    });
    //昵称设置
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');//只有自己收得到这个事件
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            //socket.broadcast.emit('foo');//表示向除自己外的所有人发送该事件
            io.sockets.emit('system', nickname, users.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        };
    });
    //断开连接的事件
	socket.on('disconnect', function() {
    	//将断开连接的用户从users中删除
    	users.splice(socket.userIndex, 1);
    	//通知除自己以外的所有人
    	socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});
	//接收新消息
    socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    //接收用户发来的图片
 	socket.on('img', function(imgData) {
    	//通过一个newImg事件分发到除自己外的每个用户
     	socket.broadcast.emit('newImg', socket.nickname, imgData);
 	});
});


