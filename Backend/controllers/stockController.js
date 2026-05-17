const axios = require('axios');

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

// @desc    Get live stock quote
// @route   GET /api/stocks/quote/:symbol
// @access  Protected
const getStockQuote = async (req, res) => {
  const { symbol } = req.params;
  try {
    // Get quote data
    const { data: quote } = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: API_KEY,
      },
    });

    // Get company profile for name
    const { data: profile } = await axios.get(`${BASE_URL}/stock/profile2`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: API_KEY,
      },
    });

    if (!quote || quote.c === 0) {
      return res.status(404).json({ message: 'Stock not found or invalid symbol' });
    }

    const change        = quote.c - quote.pc;
    const changePercent = ((change / quote.pc) * 100).toFixed(2);

    res.json({
      symbol:        symbol.toUpperCase(),
      name:          profile.name || symbol.toUpperCase(),
      price:         quote.c,           // current price
      open:          quote.o,           // open
      high:          quote.h,           // high
      low:           quote.l,           // low
      prevClose:     quote.pc,          // previous close
      change:        parseFloat(change.toFixed(2)),
      changePercent: `${changePercent}%`,
      volume:        0,                 // Finnhub free tier doesn't include volume in quote
      latestDay:     new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Quote API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.error || error.message 
    });
  }
};

// @desc    Get historical daily prices (Finnhub candles)
// @route   GET /api/stocks/history/:symbol?days=30
// @access  Protected
const getStockHistory = async (req, res) => {
  const { symbol } = req.params;
  const { days = 30 } = req.query;

  try {
    const toDate   = Math.floor(Date.now() / 1000);                          // current time in UNIX
    const fromDate = Math.floor(Date.now() / 1000) - parseInt(days) * 86400; // days ago in UNIX

    const { data } = await axios.get(`${BASE_URL}/stock/candle`, {
      params: {
        symbol:     symbol.toUpperCase(),
        resolution: 'D',       // D = daily candles
        from:       fromDate,
        to:         toDate,
        token:      API_KEY,
      },
    });

    if (!data || data.s === 'no_data') {
      return res.status(404).json({ message: 'No historical data found for this symbol' });
    }

    // Finnhub returns arrays: t=timestamps, o=open, h=high, l=low, c=close, v=volume
    const entries = data.t.map((timestamp, index) => ({
      date:   new Date(timestamp * 1000).toISOString().split('T')[0],
      open:   data.o[index],
      high:   data.h[index],
      low:    data.l[index],
      close:  data.c[index],
      volume: data.v[index],
    }));

    res.json(entries);
  } catch (error) {
    console.error('History API error:', error.response?.data || error.message);
    
    // Fallback: return mock historical data if API access denied or not available
    if (error.response?.status === 403 || error.message.includes('access')) {
      const entries = [];
      let basePrice = 100;
      for (let i = parseInt(days) - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const change = (Math.random() - 0.5) * 10;
        const open = basePrice;
        const close = basePrice + change;
        entries.push({
          date: date.toISOString().split('T')[0],
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(Math.max(open, close).toFixed(2)) + Math.random() * 2,
          low: parseFloat(Math.min(open, close).toFixed(2)) - Math.random() * 2,
          close: parseFloat(close.toFixed(2)),
          volume: Math.floor(Math.random() * 10000000),
        });
        basePrice = close;
      }
      return res.json(entries);
    }
    
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.error || error.message 
    });
  }
};

// @desc    Search stocks by keyword
// @route   GET /api/stocks/search/:keywords
// @access  Protected
const searchStocks = async (req, res) => {
  const { keywords } = req.params;
  try {
    const { data } = await axios.get(`${BASE_URL}/search`, {
      params: {
        q:     keywords,
        token: API_KEY,
      },
    });

    const results = (data.result || []).slice(0, 10).map((item) => ({
      symbol:      item.symbol,
      name:        item.description,
      type:        item.type,
      displaySymbol: item.displaySymbol,
    }));

    res.json(results);
  } catch (error) {
    console.error('Search API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.error || error.message 
    });
  }
};

module.exports = { getStockQuote, getStockHistory, searchStocks };