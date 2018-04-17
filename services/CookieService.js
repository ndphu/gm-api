class CookieService {
  constructor() {
    this.cookies = [];
    this.cookieHeader = '';
    this.mode = 0;
  }
  
  setCookieHeader(cookieHeader) {
    this.mode = 1;
    this.cookieHeader = cookieHeader;
  }
  
  setCookies(cookies) {
    this.mode = 0;
    this.cookies = cookies;
  };
  
  getCookies() {
    return this.cookies;
  };
  
  getCookieHeader() {
    if (this.mode === 1) {
      return this.cookieHeader;
    } else {
      return this.buildCookieHeader();
    }
  };
  
  buildCookieHeader() {
    let cookieHeader = [];
    this.cookies.forEach((cookie) => {
      let cookieChunk = cookie.split(';')[0];
      let cookieKey = cookieChunk.split('=')[0];
      if (cookieKey === '__cfduid' || cookieKey === 'vtv') {
        cookieHeader.push(cookieChunk + '; ');
      }
    });
    let header = cookieHeader.join('; ') + '___cc=VNM;';
    console.log('Return cookie header: ' + header);
    return header;
  };
  
  
}

const cookieService = new CookieService();
module.exports = cookieService;