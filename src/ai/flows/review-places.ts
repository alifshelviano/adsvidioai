export interface ReviewPlaceOutput {
  placeName: string;
  imageUrl: string;
  script: string;
}

export async function reviewPlace(input: { url: string }): Promise<ReviewPlaceOutput> {
  console.log('Generating review for', input.url);

  // Simulate API call to generate review
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    placeName: 'The Grand Budapest Hotel',
    imageUrl: 'https://picsum.photos/seed/picsum/1024/576',
    script: `Welcome to The Grand Budapest Hotel, a charming and historic hotel nestled in the heart of Zubrowka. With its stunning architecture, luxurious amenities, and impeccable service, this hotel is the perfect destination for your next getaway.`,
  };
}
