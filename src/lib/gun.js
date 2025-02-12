import Gun from 'gun';

const gun = Gun({
  peers: ['https://relay-server-db7s.onrender.com']
});

export default gun;
