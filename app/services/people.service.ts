// src/app/services/people.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable, throwError } from 'rxjs';

interface QuoteData {
    [likes: string]: string[];
}

export interface Person {
    id: number;
    name: string;
    favorite_color: string;
    quotes: QuoteData;
}

@Injectable({
    providedIn: 'root'
})
export class PeopleService {
    private _apiUrl: string = `http://localhost:5001/`;

    constructor(private _http: HttpClient) { }

    search(term: string, color: string): Observable<any> {
        let params = new HttpParams();
        if (term) { params = params.set('term', term); }
        if (color) { params = params.set('color', color); }

        return this._http.get<any>(`${this._apiUrl}search`, { params });
    }

    getPersonDetail(id: string): Observable<Person> {
        return this._http.get<any>(`${this._apiUrl}details/${id}`)
            .pipe(
                map((person: Person) => ({
                    ...person,
                    quotes: this._sortQuotes(person.quotes),
                })),
                catchError((error) => {
                    console.error('Error fetching data', error);
                    return throwError(() => new Error('Failed to fetch data'));
                })
            );
    }

    private _sortQuotes(quotes: QuoteData): QuoteData {
        return Object.entries(quotes)
            .sort(([a], [b]) => {
                return Number(b) - Number(a);
            })
            .reduce((sortedQuotes: QuoteData, [likes, quoteList]) => {
                sortedQuotes[likes] = quoteList.sort();
                return sortedQuotes;
            }, {});
    };
}
