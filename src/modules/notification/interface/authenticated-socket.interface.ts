import { Socket } from 'socket.io';

export interface IAuthenticatedSocket extends Socket {
  data: {
    user: {
      sub: string;
    };
  };
}
