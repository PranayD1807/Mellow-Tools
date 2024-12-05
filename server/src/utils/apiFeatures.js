class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };

        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]); //this will remove all params from exclusdedFields in the query

        let queryStr = JSON.stringify(queryObj); // converting to string

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|ne)\b/g, match => `$${match}`);
        //Here, b for to exact match words, and g for to replace all

        // Parse the query string back into an object
        const parsedQuery = JSON.parse(queryStr);

        // Handle $in operator specifically
        for (const key in parsedQuery) {
            if (parsedQuery[key].$in) {
                parsedQuery[key].$in = parsedQuery[key].$in.split(',');
            }
        }
        // console.log(parsedQuery);
        this.query = this.query.find(parsedQuery);
        return this; //returns entire object
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            //sort('price ratingsAverage')
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this; //returns entire object
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
            // this.query = this.query.select('name duration price')
        } else {
            this.query = this.query.select('-__v'); //here - means exclude
        }
        return this; //returns entire object
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        // page=3&limit=10, 1-10 page 1, 11-20 page 2 ....
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

export default APIFeatures;