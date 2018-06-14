// Event = 939653


var axios = require('axios')
var _ = require('lodash');
const getPages = process.env.PAGES || 5;
const status = [];
let nextUrl = `${process.env.DOMAIN}/api/0/issues/${process.env.EVENT}/events/`
const get = async function () {
  const result = await axios({ url: nextUrl, headers: { Authorization: `Bearer ${process.env.TOKEN}` } });
  result.data.map((item) => {
    if (item.entries) {
      const breadcrumb = item.entries.find((entry) => { return entry.type === 'breadcrumbs' });
      if (breadcrumb) {
        const xhrResult = breadcrumb.data.values.find((bread) => { return bread.data && bread.data.url.match(process.env.API) });
        if (xhrResult) {
          status.push({ id: item.eventID, profileId: _.get(item, 'extra.profileId'), status: xhrResult.data.status_code});
        }
      }
    }
  });
  const linkHeader = result.headers.link;
  const pag = linkHeader.split(',');
  const urlSpaced = pag[1].replace(' ', '');
  nextUrl = urlSpaced.match(/<(.*)>/)[1];
}
const getUrls = async () => {
  for (var i = 0; i < getPages; i++) {
    console.info('Getting page', i + 1);
    await get();
  }
  if (process.env.LIST) {
    console.info(status)
  } else {
    console.info(_.countBy(status, (a) => { return a.status }));
  }
}
getUrls();
