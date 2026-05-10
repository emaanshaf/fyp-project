// src/services/hadithApi.js
// Sample hadith data (since free hadith APIs may have CORS issues)
export const getHadiths = async () => {
  // Return static hadith data for now
  return [
    {
      id: 1,
      text: "The best among you are those who have the best manners and character.",
      reference: "Sahih Bukhari",
      book: "Book 73, Hadith 56",
    },
    {
      id: 2,
      text: "Seeking knowledge is an obligation upon every Muslim.",
      reference: "Sunan Ibn Majah",
      book: "Book 1, Hadith 224",
    },
    {
      id: 3,
      text: "None of you truly believes until he loves for his brother what he loves for himself.",
      reference: "Sahih Bukhari",
      book: "Book 2, Hadith 13",
    },
    {
      id: 4,
      text: "The strong person is not the one who can wrestle, but the one who controls himself when angry.",
      reference: "Sahih Bukhari",
      book: "Book 73, Hadith 135",
    },
    {
      id: 5,
      text: "Kindness is a mark of faith, and whoever is not kind has no faith.",
      reference: "Sahih Muslim",
      book: "Book 32, Hadith 6273",
    },
    {
      id: 6,
      text: "Cleanliness is half of faith.",
      reference: "Sahih Muslim",
      book: "Book 2, Hadith 432",
    },
    {
      id: 7,
      text: "The best of you are those who are best to their families.",
      reference: "Sunan Tirmidhi",
      book: "Book 1, Hadith 123",
    },
    {
      id: 8,
      text: "A smile to your brother is charity.",
      reference: "Sunan Tirmidhi",
      book: "Book 27, Hadith 141",
    },
  ];
};

// Search hadiths
export const searchHadiths = async (keyword) => {
  const allHadiths = await getHadiths();
  return allHadiths.filter(hadith => 
    hadith.text.toLowerCase().includes(keyword.toLowerCase()) ||
    hadith.reference.toLowerCase().includes(keyword.toLowerCase())
  );
};