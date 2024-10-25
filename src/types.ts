export interface User {
  id: number;
  username: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  image?: string;
  createdAt: string;
  user?: User;
  likesCount: number;
  commentsCount: number;
}

export interface Story {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: User;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  user?: User;
}

export interface Comment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  user?: User;
}