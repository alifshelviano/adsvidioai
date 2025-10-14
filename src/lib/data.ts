import type { Project } from "@/lib/types";
import { placeholderImages } from "@/lib/placeholder-images.json";

const [
  project1Image,
  project2Image,
  project3Image,
  product1Image,
] = placeholderImages;


export const projects: Project[] = [
  {
    id: "1",
    name: "Autumn Coffee Blend",
    product: {
      title: "Autumn Spice Roast",
      description: "A warm and inviting coffee blend with notes of cinnamon, nutmeg, and a hint of clove. Perfect for crisp autumn mornings.",
      price: 18.99,
      imageUrl: product1Image.imageUrl,
      imageHint: product1Image.imageHint,
    },
    createdAt: "2023-10-26",
    imageUrl: project1Image.imageUrl,
    imageHint: project1Image.imageHint,
  },
  {
    id: "2",
    name: "Wireless ANC Headphones",
    product: {
      title: "SoundScape Pro Headphones",
      description: "Experience immersive audio with our new noise-cancelling headphones. Crystal clear highs, deep bass, and 30-hour battery life.",
      price: 149.99,
      imageUrl: "https://picsum.photos/seed/p2/600/400",
      imageHint: "headphones product"
    },
    createdAt: "2023-10-24",
    imageUrl: project2Image.imageUrl,
    imageHint: project2Image.imageHint,
  },
  {
    id: "3",
    name: "Eco-Friendly Yoga Mat",
    product: {
      title: "Aura Natural Cork Yoga Mat",
      description: "Find your balance with our sustainable and non-slip cork yoga mat. Kind to you, and kind to the planet.",
      price: 79.00,
      imageUrl: "https://picsum.photos/seed/p3/600/400",
      imageHint: "yoga mat"
    },
    createdAt: "2023-10-22",
    imageUrl: project3Image.imageUrl,
    imageHint: project3Image.imageHint,
  },
];

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    return projects.find(p => p.id === id);
}