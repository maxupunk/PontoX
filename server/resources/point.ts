export function pointShowResource(point: any) {
    return {
        id: point.id,
        name: point.user?.name,
        entryDate: point.entryDate,
        entryTime: point.entryTime,
        departureDate: point.departureDate,
        departureTime: point.departureTime,
    }
}

export function pointIndexResource(points: any[], pagination: { total: number, page: number, limit: number }) {
    return {
        data: points.map(pointShowResource),
        pagination: {
            total: pagination.total,
            page: pagination.page,
            limit: pagination.limit,
            hasMore: pagination.page * pagination.limit < pagination.total,
        },
    }
}