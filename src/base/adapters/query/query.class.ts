export type QueryInputType = {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    searchNameTerm?: string | null;
    searchLoginTerm?: string | null;
    searchEmailTerm?: string | null;
}

export type QueryOutputType = {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    searchNameTerm: string | null;
    searchLoginTerm: string | null;
    searchEmailTerm: string | null;
}

export class QueryParams {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    searchNameTerm: string | null;
    searchLoginTerm: string | null;
    searchEmailTerm: string | null;
    /*constructor(private readonly query:QueryInputType) {}*/
    constructor(query: QueryInputType) {
        this.pageNumber = !isNaN(Number(query.pageNumber)) ? Number(query.pageNumber) : 1;
        this.pageSize = !isNaN(Number(query.pageSize)) ? Number(query.pageSize) : 10;
        this.sortBy = query.sortBy ? query.sortBy : 'createdAt';
        this.sortDirection = query.sortDirection ? query.sortDirection : 'desc';
        this.searchNameTerm = query.searchNameTerm ? query.searchNameTerm : null;
        this.searchLoginTerm = query.searchLoginTerm ? query.searchLoginTerm : null;
        this.searchEmailTerm = query.searchEmailTerm ? query.searchEmailTerm : null;
    }
    sanitize(): QueryOutputType {
        return {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
            searchNameTerm: this.searchNameTerm,
            searchLoginTerm: this.searchLoginTerm,
            searchEmailTerm: this.searchEmailTerm
        };
    }
}
