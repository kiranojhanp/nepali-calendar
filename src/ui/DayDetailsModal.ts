import { Modal, App, setIcon } from "obsidian";
import type { Moment } from "moment";
import { gregorianToNepali } from "src/utils/bikramSambat";

export interface DayData {
	calendarInfo: {
		dates: {
			bs: {
				year: { np: string; en: string };
				month: {
					np: string;
					code: { np: string; en: string };
					en: string;
				};
				day: { np: string; en: string };
				full: { np: string; en: string };
			};
			ad: {
				year: { np: string; en: string };
				month: {
					np: string;
					code: { np: string; en: string };
					en: string;
				};
				day: { np: string; en: string };
				full: { np: string; en: string };
			};
		};
		days: {
			dayOfWeek: { np: string; en: string };
			codes: { np: string; en: string };
		};
		nepaliEra?: {
			sakSambat?: { np: string; en: string };
			nepalSambat?: {
				year: { np: string; en: string };
				month: {
					np: string;
					code: { np: string; en: string };
					en: string | null;
				};
			};
		};
	};
	tithiDetails?: {
		title: { np: string | null; en: string | null };
		code: { np: string | null; en: string | null };
		endTime: { np: string | null; en: string | null };
		display: { np: string | null; en: string | null };
	};
	panchangaDetails?: {
		pakshya?: { np: string | null; en: string | null };
		chandraRashi?: {
			time: { np: string | null; en: string | null };
			endTime: { np: string | null; en: string | null };
		};
		suryaRashi?: { np: string | null; en: string | null };
		nakshatra?: {
			np: string | null;
			endTime: { np: string | null; en: string | null };
			ghaPa?: { np: string | null; en: string | null };
		};
		yog?: {
			np: string | null;
			en: string | null;
			endTime: { np: string | null; en: string | null };
		};
		karans?: {
			first: {
				np: string | null;
				endTime: { np: string | null; en: string | null };
			};
			second: {
				np: string | null;
				endTime: { np: string | null; en: string | null };
			};
		};
		season?: {
			name: { np: string | null; en: string | null };
			code: { np: string | null; en: string | null };
		};
		times?: {
			sunrise: string | null;
			sunset: string | null;
			moonrise: string | null;
			moonset: string | null;
		};
	};
	events?: Array<{
		title: { np: string; en: string };
		description?: { np: string | null; en: string | null };
	}>;
	holidays?: Array<{
		title: { np: string; en: string };
		type?: string;
	}>;
}

export class DayDetailsModal extends Modal {
	private date: Moment;
	private dayData: DayData | null = null;
	private loading = true;

	constructor(app: App, date: Moment) {
		super(app);
		this.date = date;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.addClass("nepali-day-details-modal");

		// Show loading state
		this.renderLoading();

		// Fetch data
		await this.fetchDayData();

		// Render content
		contentEl.empty();
		if (this.dayData) {
			this.renderContent();
		} else {
			this.renderError();
		}
	}

	private renderLoading() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createDiv({ cls: "day-details-loading" }, (div) => {
			div.createEl("div", { cls: "loading-spinner" });
			div.createEl("p", { text: "Loading day details..." });
		});
	}

	private renderError() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createDiv({ cls: "day-details-error" }, (div) => {
			div.createEl("h3", { text: "Unable to load details" });
			div.createEl("p", {
				text: "Could not fetch calendar data for this date.",
			});
		});
	}

	private async fetchDayData() {
		try {
			const nepaliDate = gregorianToNepali(this.date.toDate());
			const month = nepaliDate.month.toString().padStart(2, "0");

			const response = await fetch(
				`https://data.miti.bikram.io/data/${nepaliDate.year}/${month}.json`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch data");
			}

			const monthData: DayData[] = await response.json();
			this.dayData =
				monthData.find(
					(d) =>
						parseInt(d.calendarInfo.dates.bs.day.en) ===
						nepaliDate.day
				) || null;

			this.loading = false;
		} catch (error) {
			console.error("Error fetching day data:", error);
			this.dayData = null;
			this.loading = false;
		}
	}

	private renderContent() {
		const { contentEl } = this;
		if (!this.dayData) return;

		const data = this.dayData;

		// Header with date
		contentEl.createDiv({ cls: "day-details-header" }, (header) => {
			const dateInfo = header.createDiv({ cls: "date-info" });

			// BS Date (large)
			dateInfo.createDiv({ cls: "bs-date-large" }, (div) => {
				div.createEl("span", {
					cls: "day-number",
					text: data.calendarInfo.dates.bs.day.np,
				});
				div.createEl("span", {
					cls: "day-name",
					text: data.calendarInfo.days.dayOfWeek.np,
				});
			});

			// AD Date
			dateInfo.createDiv({ cls: "ad-date" }, (div) => {
				div.createEl("span", {
					text: `${data.calendarInfo.dates.ad.month.en} ${data.calendarInfo.dates.ad.day.en}, ${data.calendarInfo.dates.ad.year.en}`,
				});
			});

			// BS Month and Year
			dateInfo.createDiv({ cls: "bs-month-year" }, (div) => {
				div.createEl("span", {
					text: `${data.calendarInfo.dates.bs.month.np} ${data.calendarInfo.dates.bs.year.np}`,
				});
			});
		});

		// Events and Holidays
		if (data.events || data.holidays) {
			contentEl.createDiv(
				{ cls: "day-details-section events-section" },
				(section) => {
					const titleEl = section.createEl("h3", {
						cls: "section-title",
					});
					const iconEl = titleEl.createSpan({ cls: "section-icon" });
					setIcon(iconEl, "calendar-days");
					titleEl.createSpan({ text: " Events & Holidays" });

					if (data.events) {
						data.events.forEach((event) => {
							section.createDiv({ cls: "event-item" }, (div) => {
								div.createEl("span", {
									text: event.title.np || event.title.en,
								});
								if (
									event.description?.np ||
									event.description?.en
								) {
									div.createEl("span", {
										text:
											event.description.np ||
											event.description.en ||
											"",
										cls: "event-description",
									});
								}
							});
						});
					}

					if (data.holidays) {
						data.holidays.forEach((holiday) => {
							section.createDiv(
								{ cls: "holiday-item" },
								(div) => {
									div.createEl("span", {
										text:
											holiday.title.np ||
											holiday.title.en,
									});
									if (holiday.type) {
										div.createEl("span", {
											text: holiday.type,
											cls: "holiday-type",
										});
									}
								}
							);
						});
					}
				}
			);
		}

		// Panchanga Details
		if (data.panchangaDetails || data.tithiDetails) {
			contentEl.createDiv(
				{ cls: "day-details-section panchanga-section" },
				(section) => {
					const titleEl = section.createEl("h3", {
						cls: "section-title",
					});
					const iconEl = titleEl.createSpan({ cls: "section-icon" });
					setIcon(iconEl, "sparkles");
					titleEl.createSpan({ text: " Panchanga" });

					const grid = section.createDiv({ cls: "panchanga-grid" });

					// Tithi
					if (data.tithiDetails?.title?.np) {
						let subtitle = data.tithiDetails.display?.np;
						if (data.tithiDetails.endTime?.np) {
							subtitle = subtitle
								? `${subtitle} • ${data.tithiDetails.endTime.np} सम्म`
								: `${data.tithiDetails.endTime.np} सम्म`;
						}
						this.createPanchangaItem(
							grid,
							"Tithi",
							"तारिख:",
							data.tithiDetails.title.np,
							subtitle
						);
					}

					// Paksha
					if (data.panchangaDetails?.pakshya?.np) {
						const pakshyaValue = data.panchangaDetails.pakshya.en
							? `${data.panchangaDetails.pakshya.np} (${data.panchangaDetails.pakshya.en})`
							: data.panchangaDetails.pakshya.np;
						this.createPanchangaItem(
							grid,
							"Paksha",
							"पक्ष:",
							pakshyaValue
						);
					}

					// Chandra Rashi (Moon Sign)
					if (data.panchangaDetails?.chandraRashi?.time?.np) {
						const chandraRashiSubtitle = data.panchangaDetails
							.chandraRashi.endTime?.np
							? `${data.panchangaDetails.chandraRashi.endTime.np} सम्म`
							: null;
						this.createPanchangaItem(
							grid,
							"Moon Sign",
							"चन्द्र राशि:",
							data.panchangaDetails.chandraRashi.time.np,
							chandraRashiSubtitle
						);
					}

					// Surya Rashi (Sun Sign)
					if (data.panchangaDetails?.suryaRashi?.np) {
						this.createPanchangaItem(
							grid,
							"Sun Sign",
							"सूर्य राशि:",
							data.panchangaDetails.suryaRashi.np
						);
					}

					// Nakshatra
					if (data.panchangaDetails?.nakshatra?.np) {
						let nakshatraSubtitle = null;
						if (data.panchangaDetails.nakshatra.endTime?.np) {
							nakshatraSubtitle = `${data.panchangaDetails.nakshatra.endTime.np} सम्म`;
						}
						if (data.panchangaDetails.nakshatra.ghaPa?.np) {
							nakshatraSubtitle = nakshatraSubtitle
								? `${nakshatraSubtitle} • ${data.panchangaDetails.nakshatra.ghaPa.np}`
								: data.panchangaDetails.nakshatra.ghaPa.np;
						}
						this.createPanchangaItem(
							grid,
							"Nakshatra",
							"नक्षत्र:",
							data.panchangaDetails.nakshatra.np,
							nakshatraSubtitle
						);
					}

					// Yoga
					if (data.panchangaDetails?.yog?.np) {
						const yogSubtitle = data.panchangaDetails.yog.endTime
							?.np
							? `${data.panchangaDetails.yog.endTime.np} सम्म`
							: null;
						this.createPanchangaItem(
							grid,
							"Yoga",
							"योग:",
							data.panchangaDetails.yog.np,
							yogSubtitle
						);
					}

					// Karan
					if (data.panchangaDetails?.karans?.first?.np) {
						const karanText = data.panchangaDetails.karans.second
							?.np
							? `${data.panchangaDetails.karans.first.np} / ${data.panchangaDetails.karans.second.np}`
							: data.panchangaDetails.karans.first.np;
						let karanSubtitle = null;
						if (data.panchangaDetails.karans.first.endTime?.np) {
							karanSubtitle = `${data.panchangaDetails.karans.first.endTime.np} सम्म`;
							if (
								data.panchangaDetails.karans.second?.endTime?.np
							) {
								karanSubtitle += ` / ${data.panchangaDetails.karans.second.endTime.np} सम्म`;
							}
						}
						this.createPanchangaItem(
							grid,
							"Karan",
							"करण:",
							karanText,
							karanSubtitle
						);
					}

					// Season (Ritu)
					if (data.panchangaDetails?.season?.name?.np) {
						const seasonValue = data.panchangaDetails.season.name.en
							? `${data.panchangaDetails.season.name.np} (${data.panchangaDetails.season.name.en})`
							: data.panchangaDetails.season.name.np;
						this.createPanchangaItem(
							grid,
							"Season",
							"ऋतु:",
							seasonValue
						);
					}
				}
			);
		}

		// Sun and Moon Times
		if (data.panchangaDetails?.times) {
			contentEl.createDiv(
				{ cls: "day-details-section times-section" },
				(section) => {
					const titleEl = section.createEl("h3", {
						cls: "section-title",
					});
					const iconEl = titleEl.createSpan({ cls: "section-icon" });
					setIcon(iconEl, "sun");
					titleEl.createSpan({ text: " Sun & Moon Times" });

					const grid = section.createDiv({ cls: "times-grid" });

					if (data.panchangaDetails?.times?.sunrise) {
						this.createTimeItem(
							grid,
							"https://img.icons8.com/color/48/000000/sunrise.png",
							"Sunrise",
							data.panchangaDetails.times.sunrise,
							true
						);
					}

					if (data.panchangaDetails?.times?.sunset) {
						this.createTimeItem(
							grid,
							"https://img.icons8.com/color/48/000000/sunset.png",
							"Sunset",
							data.panchangaDetails.times.sunset,
							true
						);
					}

					if (data.panchangaDetails?.times?.moonrise) {
						this.createTimeItem(
							grid,
							"moon",
							"Moonrise",
							data.panchangaDetails.times.moonrise
						);
					}

					if (data.panchangaDetails?.times?.moonset) {
						this.createTimeItem(
							grid,
							"moon-star",
							"Moonset",
							data.panchangaDetails.times.moonset
						);
					}
				}
			);
		}

		// Nepali Era
		if (data.calendarInfo.nepaliEra) {
			contentEl.createDiv(
				{ cls: "day-details-section era-section" },
				(section) => {
					const titleEl = section.createEl("h3", {
						cls: "section-title",
					});
					const iconEl = titleEl.createSpan({ cls: "section-icon" });
					setIcon(iconEl, "scroll");
					titleEl.createSpan({ text: " Other Eras" });

					const grid = section.createDiv({ cls: "era-grid" });

					if (data.calendarInfo.nepaliEra.sakSambat) {
						const sakValue = data.calendarInfo.nepaliEra.sakSambat
							.en
							? `${data.calendarInfo.nepaliEra.sakSambat.np} (${data.calendarInfo.nepaliEra.sakSambat.en})`
							: data.calendarInfo.nepaliEra.sakSambat.np;
						this.createEraItem(grid, "Sak Sambat", sakValue);
					}

					if (data.calendarInfo.nepaliEra.nepalSambat) {
						const nepalSambatValue = `${
							data.calendarInfo.nepaliEra.nepalSambat.year.np
						} ${
							data.calendarInfo.nepaliEra.nepalSambat.month.np ||
							""
						}`;
						this.createEraItem(
							grid,
							"Nepal Sambat",
							nepalSambatValue
						);
					}
				}
			);
		}
	}

	private createPanchangaItem(
		container: HTMLElement,
		label: string,
		nepaliLabel: string,
		value: string,
		subtitle?: string | null
	) {
		container.createDiv({ cls: "panchanga-item" }, (item) => {
			item.createDiv({ cls: "panchanga-label" }, (label) => {
				label.createEl("span", { text: nepaliLabel, cls: "label-np" });
			});
			item.createDiv({ cls: "panchanga-value" }, (val) => {
				val.createEl("span", { text: value });
				if (subtitle) {
					val.createEl("span", {
						text: subtitle,
						cls: "value-subtitle",
					});
				}
			});
		});
	}

	private createTimeItem(
		container: HTMLElement,
		icon: string,
		label: string,
		time: string,
		isIconUrl = false
	) {
		container.createDiv({ cls: "time-item" }, (item) => {
			if (isIconUrl) {
				item.createEl("img", {
					attr: { src: icon, alt: label },
					cls: "time-icon-img",
				});
			} else {
				const iconEl = item.createDiv({ cls: "time-icon-lucide" });
				setIcon(iconEl, icon);
			}
			item.createDiv({ cls: "time-info" }, (info) => {
				info.createEl("span", { text: label, cls: "time-label" });
				info.createEl("span", { text: time, cls: "time-value" });
			});
		});
	}

	private createEraItem(
		container: HTMLElement,
		label: string,
		value: string
	) {
		container.createDiv({ cls: "era-item" }, (item) => {
			item.createEl("span", { text: label, cls: "era-label" });
			item.createEl("span", { text: value, cls: "era-value" });
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
