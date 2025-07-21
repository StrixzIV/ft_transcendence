import { NODE_ENV } from '@/config/env';
import { FRONTEND_URL } from '@/config/url';

const corsProperties = {
    origin: NODE_ENV === 'production' ? FRONTEND_URL : '*'
};

export default corsProperties;