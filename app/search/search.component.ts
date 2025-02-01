import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { PeopleService, Person } from '../services/people.service';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule]
})
export class SearchComponent implements OnInit, OnDestroy {
	private _ngUnsubscribe$: Subject<void> = new Subject<void>();
	private _peopleService = inject(PeopleService);
	private _route = inject(ActivatedRoute);
	private _router = inject(Router);

	colorOptions: any[] = [
		{
			value: '',
			display: 'Select'
		},
		{
			value: 'blue',
			display: 'blue'
		},
		{
			value: 'red',
			display: 'red'
		},
		{
			value: 'green',
			display: 'green'
		}
	];
	results: Person[] = [];
	resultsMessage: string = 'No results found.';
	searchForm: FormGroup = new FormGroup({
		name: new FormControl('', [Validators.pattern('^[A-Za-z]+$')]),
		color: new FormControl(this.colorOptions[0].value)
	});
	searchParameters: string = '';
	searchPerformed$: Subject<boolean> = new Subject<boolean>();

	constructor() { }

	ngOnInit(): void {
		this._route
			.queryParams
			.pipe(takeUntil(this._ngUnsubscribe$))
			.subscribe((params: any) => {
				const name = params['name'] || '';
				const color = params['color'] || '';
				this.searchForm.setValue({ name, color });

				if (name || color) this.getResults(name, color);
			});
	}

	ngOnDestroy(): void {
		this._ngUnsubscribe$.next();
		this._ngUnsubscribe$.complete();
		this.searchPerformed$.complete();
	}

	onSubmit(): void {
		const { name, color } = this.searchForm.value;
		this.searchParameters = `${name} ${color}`;
		this.getResults(name, color);

		this._router.navigate([], {
			relativeTo: this._route,
			queryParams: { name, color },
			queryParamsHandling: 'merge'
		});
	}

	getResults(name: string, color: string): void {
		this._peopleService
			.search(name, color)
			.pipe(takeUntil(this._ngUnsubscribe$))
			.subscribe({
				next: response => {
					this.results = response.matches.sort((a: any, b: any) => a.name.localeCompare(b.name));
					this.searchPerformed$.next(true);
				},
				error: err => {
					console.error('Error fetching search results', err);
					this.resultsMessage = 'An error occurred while fetching results. Please try again later.';
					this.results = [];
				}
			});
	}

	getSearchFormValidity(): boolean { return this.searchForm.get('name')?.value === '' && !this.searchForm.get('color')?.value; }

	goToPersonDetail(id: number): void { this._router.navigate([`/details/${id}`], { queryParams: this.searchForm.value }); }

}
