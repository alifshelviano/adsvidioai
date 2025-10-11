export type Product = {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
};

export type Project = {
  id: string;
  name: string;
  product: Product;
  createdAt: string;
  imageUrl: string;
  imageHint: string;
};

export type AdContent = {
  adCopy: string;
  hashtags: string;
  captions: string;
};
