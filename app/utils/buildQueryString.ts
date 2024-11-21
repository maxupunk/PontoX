export default function buildQueryString(params ?: Record<string, any>): string {
    if (!params) return '';

    const queryParams = new URLSearchParams();

    for (const key in params) {
        if (params[key] !== undefined) {
            queryParams.append(key, params[key].toString());
        }
    }

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
}