export interface CountryConfig {
  code: string;
  urlCode: string;
  name: string;
  currency: string;
  flagUrl: string;
  reviewers: Array<{
    name: string;
    reviews: number;
    badge: string;
  }>;
  dishes: Array<{
    name: string;
    votes: number;
    trend: string;
  }>;
  locations: Array<{
    name: string;
    restaurants: number;
    newCount: string;
  }>;
}

export const COUNTRIES: { [key: string]: CountryConfig } = {
  my: {
    code: 'my',
    urlCode: 'my',
    name: 'Malaysia',
    currency: 'MYR',
    flagUrl: '/flags/malaysia.png',
    reviewers: [
      { name: 'Sarah Chen', reviews: 128, badge: '🏆 Elite' },
      { name: 'Mike Wong', reviews: 96, badge: '⭐ Pro' },
      { name: 'Lisa Tan', reviews: 84, badge: '🌟 Rising' },
      { name: 'David Lim', reviews: 76, badge: '💫 Active' },
      { name: 'Jenny Koh', reviews: 72, badge: '✨ Explorer' },
    ],
    dishes: [
      { name: 'Nasi Lemak', votes: 256, trend: '↑ 15%' },
      { name: 'Char Kuey Teow', votes: 198, trend: '↑ 12%' },
      { name: 'Satay', votes: 167, trend: '↑ 8%' },
      { name: 'Roti Canai', votes: 145, trend: '↑ 10%' },
      { name: 'Laksa', votes: 134, trend: '↑ 7%' },
    ],
    locations: [
      {
        name: 'Bukit Bintang, KL',
        restaurants: 156,
        newCount: '+8 this month',
      },
      { name: 'Petaling Jaya', restaurants: 124, newCount: '+5 this month' },
      { name: 'Subang Jaya', restaurants: 98, newCount: '+3 this month' },
      { name: 'Bangsar', restaurants: 87, newCount: '+4 this month' },
      { name: 'Shah Alam', restaurants: 76, newCount: '+2 this month' },
    ],
  },
  sg: {
    code: 'sg',
    urlCode: 'sg',
    name: 'Singapore',
    currency: 'SGD',
    flagUrl: '/flags/singapore.png',
    reviewers: [
      { name: 'John Tan', reviews: 145, badge: '🏆 Elite' },
      { name: 'Michelle Lee', reviews: 112, badge: '⭐ Pro' },
      { name: 'Kevin Ng', reviews: 98, badge: '🌟 Rising' },
      { name: 'Rachel Goh', reviews: 85, badge: '💫 Active' },
      { name: 'Brandon Lim', reviews: 79, badge: '✨ Explorer' },
    ],
    dishes: [
      { name: 'Chili Crab', votes: 289, trend: '↑ 18%' },
      { name: 'Hainanese Chicken Rice', votes: 245, trend: '↑ 14%' },
      { name: 'Laksa', votes: 198, trend: '↑ 10%' },
      { name: 'Roti Prata', votes: 167, trend: '↑ 9%' },
      { name: 'Satay', votes: 156, trend: '↑ 8%' },
    ],
    locations: [
      { name: 'Orchard Road', restaurants: 178, newCount: '+10 this month' },
      { name: 'Chinatown', restaurants: 145, newCount: '+7 this month' },
      { name: 'Katong', restaurants: 112, newCount: '+5 this month' },
      { name: 'Tampines', restaurants: 98, newCount: '+4 this month' },
      { name: 'Jurong East', restaurants: 87, newCount: '+3 this month' },
    ],
  },
};
