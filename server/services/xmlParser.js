const xml2js = require('xml2js');

const parseXML = async (xml) => {
  try {
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);
    return result.rss?.channel?.item || [];
  } catch (error) {
    console.error('XML parsing error:', error);
    throw new Error('Invalid XML format');
  }
};
module.exports = parseXML;
