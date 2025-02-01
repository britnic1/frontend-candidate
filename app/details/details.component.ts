import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { PeopleService, Person } from '../services/people.service';

@Component({
	selector: 'app-details',
	templateUrl: './details.component.html',
	styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
	private _ngUnsubscribe$: Subject<void> = new Subject<void>();
	private _peopleService = inject(PeopleService);
	private _route = inject(ActivatedRoute);
	private _router = inject(Router);

	person: Person = null;

	constructor() { }

	ngOnInit(): void {
		const id = this._route.snapshot.paramMap.get('id');

		this._peopleService
			.getPersonDetail(id)
			.pipe(takeUntil(this._ngUnsubscribe$))
			.subscribe({
				next: (response) => (this.person = response),
				error: (err) => console.error('Error:', err)
			});
	}

	hasQuotes(): boolean { return this.person.quotes && Object.keys(this.person.quotes).length > 0; }

	sortedLikes(): string[] { return this.person ? Object.keys(this.person.quotes).sort((a, b) => Number(b) - Number(a)) : []; }

	goToSearchResults(): void { this._router.navigate([''], { queryParams: this._route.snapshot.queryParams }); }
}