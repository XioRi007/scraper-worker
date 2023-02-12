// import winston, {
//     createLogger,
//     transports,
//     format
// } from 'winston';
// import 'winston-mongodb';
// export const _logger = ()=>{
//     return createLogger({
//         transports: [
//             new transports.MongoDB({
//                 level: 'error',
//                 db: process.env.MONGODB_CONNECTION_STRING,
//                 options: {
//                     useUnifiedTopology: true
//                 },
//                 collection: 'nodejs_scraper_log'
//             })
//         ],        
//         format: format.combine(format.timestamp(), format.json(), format.errors())
//     })
// };
