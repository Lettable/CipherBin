import Gun from 'gun';

const gun = Gun({
  peers: ['http://localhost:8080']
});

export default gun;
