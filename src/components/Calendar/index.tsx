import dayjs from "dayjs";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import DatepickerContext from "../../contexts/DatepickerContext";
import {
    formatDate,
    getDaysInMonth,
    getFirstDayInMonth,
    getFirstDaysInMonth,
    getLastDaysInMonth,
    getNumberOfDay,
    loadLanguageModule,
    nextMonth,
    previousMonth,
    shortString
} from "../../helpers";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DoubleChevronLeftIcon,
    DoubleChevronRightIcon,
    RoundedButton
} from "../utils";

import Days from "./Days";
import Months from "./Months";
import Week from "./Week";
import Years from "./Years";

interface Props {
    date: dayjs.Dayjs;
    onClickPrevious: () => void;
    onClickNext: () => void;
    changeMonth: (month: number) => void;
    changeYear: (year: number) => void;
}

const Calendar: React.FC<Props> = ({
    date,
    onClickPrevious,
    onClickNext,
    changeMonth,
    changeYear
}) => {
    // Contexts
    const {
        period,
        changePeriod,
        changeDayHover,
        showFooter,
        changeDatepickerValue,
        hideDatepicker,
        asSingle,
        i18n,
        startWeekOn,
        input
    } = useContext(DatepickerContext);
    loadLanguageModule(i18n);

    // States
    const [showMonths, setShowMonths] = useState(false);
    const [showYears, setShowYears] = useState(false);
    const [year, setYear] = useState(date.year());
    // Functions
    const previous = useCallback(() => {
        return getLastDaysInMonth(
            previousMonth(date),
            getNumberOfDay(getFirstDayInMonth(date).ddd, i18n, startWeekOn)
        );
    }, [date, i18n, startWeekOn]);

    const current = useCallback(() => {
        return getDaysInMonth(formatDate(date));
    }, [date]);

    const next = useCallback(() => {
        return getFirstDaysInMonth(
            previousMonth(date),
            42 - (previous().length + current().length)
        );
    }, [current, date, previous]);

    const hideMonths = useCallback(() => {
        if (showMonths) {
            setShowMonths(false);
        }
    }, [showMonths]);

    const hideYears = useCallback(() => {
        if (showYears) {
            setShowYears(false);
        }
    }, [showYears]);

    const clickMonth = useCallback(
        (month: number) => {
            setTimeout(() => {
                changeMonth(month);
                setShowMonths(!showMonths);
            }, 250);
        },
        [changeMonth, showMonths]
    );

    const clickYear = useCallback(
        (year: number) => {
            setTimeout(() => {
                changeYear(year);
                setShowYears(!showYears);
            }, 250);
        },
        [changeYear, showYears]
    );

    const clickDay = useCallback(
        (day: number, month = date.month() + 1, year = date.year()) => {
            const fullDay = `${year}-${month}-${day}`;
            let newStart;
            let newEnd = null;

            function chosePeriod(start: string, end: string) {
                const ipt = input?.current;
                changeDatepickerValue(
                    {
                        startDate: start,
                        endDate: end
                    },
                    ipt
                );
                hideDatepicker();
            }

            if (period.start && period.end) {
                if (changeDayHover) {
                    changeDayHover(null);
                }
                changePeriod({
                    start: null,
                    end: null
                });
            }

            if ((!period.start && !period.end) || (period.start && period.end)) {
                if (!period.start && !period.end) {
                    changeDayHover(fullDay);
                }
                newStart = fullDay;
                if (asSingle) {
                    newEnd = fullDay;
                    chosePeriod(fullDay, fullDay);
                }
            } else {
                if (period.start && !period.end) {
                    // start not null
                    // end null
                    const condition =
                        dayjs(fullDay).isSame(dayjs(period.start)) ||
                        dayjs(fullDay).isAfter(dayjs(period.start));
                    newStart = condition ? period.start : fullDay;
                    newEnd = condition ? fullDay : period.start;
                } else {
                    // Start null
                    // End not null
                    const condition =
                        dayjs(fullDay).isSame(dayjs(period.end)) ||
                        dayjs(fullDay).isBefore(dayjs(period.end));
                    newStart = condition ? fullDay : period.start;
                    newEnd = condition ? period.end : fullDay;
                }

                if (!showFooter) {
                    if (newStart && newEnd) {
                        chosePeriod(newStart, newEnd);
                    }
                }
            }

            if (!(newEnd && newStart) || showFooter) {
                changePeriod({
                    start: newStart,
                    end: newEnd
                });
            }
        },
        [
            asSingle,
            changeDatepickerValue,
            changeDayHover,
            changePeriod,
            date,
            hideDatepicker,
            period.end,
            period.start,
            showFooter,
            input
        ]
    );

    const clickPreviousDays = useCallback(
        (day: number) => {
            const newDate = previousMonth(date);
            clickDay(day, newDate.month() + 1, newDate.year());
            onClickPrevious();
        },
        [clickDay, date, onClickPrevious]
    );

    const clickNextDays = useCallback(
        (day: number) => {
            const newDate = nextMonth(date);
            clickDay(day, newDate.month() + 1, newDate.year());
            onClickNext();
        },
        [clickDay, date, onClickNext]
    );

    // UseEffects & UseLayoutEffect
    useEffect(() => {
        setYear(date.year());
    }, [date]);

    // Variables
    const calendarData = useMemo(() => {
        return {
            date: date,
            days: {
                previous: previous(),
                current: current(),
                next: next()
            }
        };
    }, [current, date, next, previous]);

    return (
        <div className="w-full md:w-[297px] md:min-w-[297px]">
            <div className="flex items-center space-x-1.5 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1.5">
                {!showMonths && !showYears && (
                    <div className="flex-none">
                        <RoundedButton roundedFull={true} onClick={onClickPrevious}>
                            <ChevronLeftIcon className="h-5 w-5" />
                        </RoundedButton>
                    </div>
                )}

                {showYears && (
                    <div className="flex-none">
                        <RoundedButton
                            roundedFull={true}
                            onClick={() => {
                                setYear(year - 12);
                            }}
                        >
                            <DoubleChevronLeftIcon className="h-5 w-5" />
                        </RoundedButton>
                    </div>
                )}

                <div className="flex flex-1 items-center space-x-1.5">
                    <div className="w-1/2">
                        <RoundedButton
                            onClick={() => {
                                setShowMonths(!showMonths);
                                hideYears();
                            }}
                        >
                            <>{shortString(calendarData.date.locale(i18n).format("MMM"))}</>
                        </RoundedButton>
                    </div>

                    <div className="w-1/2">
                        <RoundedButton
                            onClick={() => {
                                setShowYears(!showYears);
                                hideMonths();
                            }}
                        >
                            <>{calendarData.date.year()}</>
                        </RoundedButton>
                    </div>
                </div>

                {!showMonths && !showYears && (
                    <div className="flex-none">
                        <RoundedButton roundedFull={true} onClick={onClickNext}>
                            <ChevronRightIcon className="h-5 w-5" />
                        </RoundedButton>
                    </div>
                )}

                {showYears && (
                    <div className="flex-none">
                        <RoundedButton
                            roundedFull={true}
                            onClick={() => {
                                setYear(year + 12);
                            }}
                        >
                            <DoubleChevronRightIcon className="h-5 w-5" />
                        </RoundedButton>
                    </div>
                )}
            </div>

            <div className="px-0.5 sm:px-2 mt-0.5 min-h-[285px]">
                {showMonths && <Months clickMonth={clickMonth} />}

                {showYears && <Years year={year} clickYear={clickYear} />}

                {!showMonths && !showYears && (
                    <>
                        <Week />

                        <Days
                            calendarData={calendarData}
                            onClickPreviousDays={clickPreviousDays}
                            onClickDay={clickDay}
                            onClickNextDays={clickNextDays}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Calendar;
