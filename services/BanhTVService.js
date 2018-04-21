const BanhTVClient = require('../client/BanhTV');
const cheerio = require('cheerio');

class BanhTVService {
  crawItem(itemUrl) {
    return new Promise((resolve, reject) => {
      BanhTVClient.getItem(itemUrl.split('banhtv.com')[1]).then((html) => {
        const $ = cheerio.load(html);
        const imageDiv = $('div.image');
        const title = imageDiv.find('div.text h1').text();
        const subTitle = imageDiv.find('div.text h2').text();
        const poster = imageDiv.find('img.avatar').attr('src');
        const bigPoster = imageDiv.find('img.poster').attr('src');
        const playPath = imageDiv.find('a.icon-play').attr('href');
        const playUrl = 'http://banhtv.com' + playPath;

        const content = $('div.film-content.block-film > p:last-child').text();
        const genres = [];
        const directors = [];
        const actors = [];
        const countries = [];


        $('ul.entry-meta.block-film li').each((i, e) => {
          const li = $(e);
          const field = li.find('label').text();
          console.log(`field = ${field}`);

          if (field.startsWith('Quốc gia')) {
            //countries.push(e.find('a').text());
            li.find('a').each((j, a) => {
              countries.push($(a).text());
            })
          }
          if (field.startsWith('Thể loại')) {
            li.find('a').each((j, a) => {
              genres.push($(a).text());
            })
          }

          if (field.startsWith('Đạo diễn')) {
            li.find('a').each((j, a) => {
              directors.push($(a).text());
            })
          }

          if (field.startsWith('Diễn viên')) {
            li.find('a').each((j, a) => {
              actors.push($(a).text());
            })
          }
        });

        BanhTVClient.getItem(playPath).then(html => {
          const $$ = cheerio.load(html);
          const type = $$('#list_episodes').length > 0 ? 'SERIE' : 'MOVIE';

          resolve({
            title: title ? title : subTitle,
            normTitle: title? title.latinise(): subTitle.latinise(),
            subTitle: subTitle ? subTitle : title,
            normSubTitle: subTitle ? subTitle.latinise() : title.latinise(),
            poster: poster,
            bigPoster: bigPoster,
            playUrl: playUrl,
            type: type,
            content: content,
            actors: actors,
            directors: directors,
            countries: countries,
            genres: genres,
          })
        });

        // {
        //   title: title ? title : subTitle,
        //     normTitle: title ? title.latinise() : subTitle.latinise(),
        //   subTitle: subTitle ? subTitle : title,
        //   normSubTitle: subTitle ? subTitle.latinise() : title.latinise(),
        //   poster: poster,
        //   bigPoster: bigPoster,
        //   source: itemUrl,
        //   hash: hash,
        //   playUrl: link,
        //   type: type,
        //   releaseDate: releaseDate,
        //   duration: duration,
        //   directors: directors,
        //   genres: genres,
        //   actors: actors,
        //   countries: countries,
        //   content: $('.content-film').text()
        // }
      })
    });
  }

}

const banhTvService = new BanhTVService();

module.exports = banhTvService;