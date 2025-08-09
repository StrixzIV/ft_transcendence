import { FRONTEND_URI } from "../config/urls";

const corsProperties = {
    origin: process.env['NODE_ENV']! === 'production' ? FRONTEND_URI : '*'
};

export default corsProperties;