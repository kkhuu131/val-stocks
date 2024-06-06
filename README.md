# Valorant Stocks Simulation Application

## Project Overview

[ValStocks](https://val-stocks.vercel.app/) is a full-stack web application that allows users to monitor and predict stock prices corresponding to VALORANT esports teams, including real-time updates and visualizations. Implemented user authentication and profile management with Discord OAuth2 using Supabase. Utilized a PostgreSQL database for storing and updating stock prices and user predictions efficiently, with scheduling and data manipulation tasks. Stock prices are updated on a minute-by-minute basis using an algorithm dependent on 3 factors: user demand (buying and selling), recent match results, and a randomness factor.

This project consists of 3 main components:

1. **Backend Server**: A server whose main purpose is to continually update both stock data and match data every minute and 5 minutes and writing it to the Supabase database, respectively. This is hosted on Render.
2. **Supabase**: For both authentication and data storage. The data model consists of the following PostgreSQL tables:
   - current_stock_prices: hold the most up to date stock price and fields that are used in the update algorithm such as demand and elo
   - stock_prices: hold archived and timestamped stock prices, mainly used to display changes over time
   - stock_schedules: hold scheduled changes to stock prices over time, primarily from match results
   - matches: hold recent and upcoming matches, which get processed once completed where updates to stock_schedules are made
   - profiles: hold user information, including balance, stocks owned, and networth
3. **React Frontend**: Data is then fetched using Supabase API and a webpage consisting of components displays real-time stock prices and changes over time using Chart.js. In addition, users can view rankings and both their own and other users' portfolios.

### Improvements

- Sentiment Analysis: In order to better model the stock price of a team the algorithm should take into account overall community sentiment. For example, reading the live comments of the r/ValorantCompetitive subreddit to determine an average sentiment of each team.
- Testing: There is no formal testing in this project, but implementing this would allow me to efficently test each component independently.
