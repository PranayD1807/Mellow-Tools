class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };

        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|ne)\b/g, match => `$${match}`);

        const parsedQuery = JSON.parse(queryStr);

        // Handle $in operator specifically
        for (const key in parsedQuery) {
            if (parsedQuery[key].$in && typeof parsedQuery[key].$in === 'string') {
                parsedQuery[key].$in = parsedQuery[key].$in.split(',');
            }
        }
        this.query = this.query.find(parsedQuery);
        return this;
    }

    search(searchableFields = []) {
        if (this.queryString.search && searchableFields.length > 0) {
            const searchTerm = this.queryString.search;
            const searchConditions = searchableFields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' }
            }));
            this.query = this.query.find({ $or: searchConditions });
        }
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');

            // For stable sorting, provide a consistent secondary sort that follows primary direction
            const isPrimaryDescending = this.queryString.sort.startsWith('-');
            const secondarySortKey = isPrimaryDescending ? '-createdAt' : 'createdAt';

            const finalSort = sortBy.includes('createdAt') ? sortBy : `${sortBy} ${secondarySortKey}`;
            this.query = this.query.sort(finalSort);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

export default APIFeatures;