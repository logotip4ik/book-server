export interface UserInput {
  name: string;
  email: string;
  isAuthor: boolean;
  isStuff?: boolean;
  password: string;
}
export interface Author {
  name: string;
  about: string;
  email: string;
}
export interface SecureUserInput {
  name: string;
  email: string;
  isAuthor?: boolean;
  isStuff?: boolean;
  password?: string;
}
export interface BookUpdateInput {
  id: number;
  title: string;
  epilogue: string;
  content: string;
  image: string;
}
export interface BookInput {
  title: string;
  epilogue: string;
  content: string;
  author: number;
  image: string;
}
