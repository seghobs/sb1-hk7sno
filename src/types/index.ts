export interface User {
  id: number;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  image?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface Story {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  expiresAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  read: boolean;
}