const processFeedItems = feedItems => feedItems.map(item => ({
  title: item.querySelector('title').textContent,
  itemDescription: item.querySelector('description').textContent,
  link: item.querySelector('link').textContent,
}));

export default (data) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(data, 'application/xml').querySelector('rss');

  if (!feed) {
    throw new Error('notRSS');
  }

  const channelName = feed.querySelector('channel > title').textContent;
  const description = feed.querySelector('description');

  const feedItemElements = [...feed.querySelectorAll('item')];
  const feedItems = processFeedItems(feedItemElements);

  return { channelName, content: { feedItems, description } };
};
