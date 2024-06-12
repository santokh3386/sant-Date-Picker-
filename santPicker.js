/*
    Control : santPicker (DatePicker)
    Author : Santokh Singh
    Vesrion :1.06.07.2024

    Change Log
    Date        Change
    07/06/2024  Added Date formats, calendar image background
 */

// Regexes and supporting functions are cached through closure
const token = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|W{1,2}|[LlopSZN]|"[^"]*"|'[^']*'/g;
const timezone = /\b(?:[A-Z]{1,3}[A-Z][TC])(?:[-+]\d{4})?|((?:Australian )?(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time)\b/g;
const timezoneClip = /[^-+\dA-Z]/g;

/**
 * @param {string | number | Date} date
 * @param {string} mask
 * @param {boolean} utc
 * @param {boolean} gmt
 */
function dateFormat(date, mask, utc, gmt) {
    // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
    if (
        arguments.length === 1 &&
        typeof date === "string" &&
        !/\d/.test(date)
    ) {
        mask = date;
        date = undefined;
    }

    date = date || date === 0 ? date : new Date();

    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    if (isNaN(date)) {
        throw TypeError("Invalid date");
    }

    mask = String(
        masks[mask] || mask || masks["default"]
    );

    // Allow setting the utc/gmt argument via the mask
    const maskSlice = mask.slice(0, 4);
    if (maskSlice === "UTC:" || maskSlice === "GMT:") {
        mask = mask.slice(4);
        utc = true;
        if (maskSlice === "GMT:") {
            gmt = true;
        }
    }

    const _ = () => (utc ? "getUTC" : "get");
    const d = () => date[_() + "Date"]();
    const D = () => date[_() + "Day"]();
    const m = () => date[_() + "Month"]();
    const y = () => date[_() + "FullYear"]();
    const H = () => date[_() + "Hours"]();
    const M = () => date[_() + "Minutes"]();
    const s = () => date[_() + "Seconds"]();
    const L = () => date[_() + "Milliseconds"]();
    const o = () => (utc ? 0 : date.getTimezoneOffset());
    const W = () => getWeek(date);
    const N = () => getDayOfWeek(date);

    const flags = {
        d: () => d(),
        dd: () => pad(d()),
        ddd: () => i18n.dayNames[D()],
        DDD: () => getDayName({
            y: y(),
            m: m(),
            d: d(),
            _: _(),
            dayName: i18n.dayNames[D()],
            short: true
        }),
        dddd: () => i18n.dayNames[D() + 7],
        DDDD: () => getDayName({
            y: y(),
            m: m(),
            d: d(),
            _: _(),
            dayName: i18n.dayNames[D() + 7]
        }),
        m: () => m() + 1,
        mm: () => pad(m() + 1),
        mmm: () => i18n.monthNames[m()],
        mmmm: () => i18n.monthNames[m() + 12],
        yy: () => String(y()).slice(2),
        yyyy: () => pad(y(), 4),
        h: () => H() % 12 || 12,
        hh: () => pad(H() % 12 || 12),
        H: () => H(),
        HH: () => pad(H()),
        M: () => M(),
        MM: () => pad(M()),
        s: () => s(),
        ss: () => pad(s()),
        l: () => pad(L(), 3),
        L: () => pad(Math.floor(L() / 10)),
        t: () =>
            H() < 12
                ? i18n.timeNames[0]
                : i18n.timeNames[1],
        tt: () =>
            H() < 12
                ? i18n.timeNames[2]
                : i18n.timeNames[3],
        T: () =>
            H() < 12
                ? i18n.timeNames[4]
                : i18n.timeNames[5],
        TT: () =>
            H() < 12
                ? i18n.timeNames[6]
                : i18n.timeNames[7],
        Z: () =>
            gmt
                ? "GMT"
                : utc
                    ? "UTC"
                    : formatTimezone(date),
        o: () =>
            (o() > 0 ? "-" : "+") +
            pad(Math.floor(Math.abs(o()) / 60) * 100 + (Math.abs(o()) % 60), 4),
        p: () =>
            (o() > 0 ? "-" : "+") +
            pad(Math.floor(Math.abs(o()) / 60), 2) +
            ":" +
            pad(Math.floor(Math.abs(o()) % 60), 2),
        S: () =>
            ["th", "st", "nd", "rd"][
            d() % 10 > 3 ? 0 : (((d() % 100) - (d() % 10) != 10) * d()) % 10
            ],
        W: () => W(),
        WW: () => pad(W()),
        N: () => N(),
    };

    return mask.replace(token, (match) => {
        if (match in flags) {
            return flags[match]();
        }
        return match.slice(1, match.length - 1);
    });
}

let masks = {
    default: "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    paddedShortDate: "mm/dd/yyyy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:sso",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    expiresHeaderFormat: "ddd, dd mmm yyyy HH:MM:ss Z",
};

// Internationalization strings
let i18n = {
    dayNames: [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ],
    monthNames: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
    timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"],
};

const pad = (val, len = 2) => String(val).padStart(len, '0');

/**
 * Get day name
 * Yesterday, Today, Tomorrow if the date lies within, else fallback to Monday - Sunday
 * @param  {Object}
 * @return {String}
 */
const getDayName = ({ y, m, d, _, dayName, short = false }) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday[_ + 'Date']() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow[_ + 'Date']() + 1);
    const today_d = () => today[_ + 'Date']();
    const today_m = () => today[_ + 'Month']();
    const today_y = () => today[_ + 'FullYear']();
    const yesterday_d = () => yesterday[_ + 'Date']();
    const yesterday_m = () => yesterday[_ + 'Month']();
    const yesterday_y = () => yesterday[_ + 'FullYear']();
    const tomorrow_d = () => tomorrow[_ + 'Date']();
    const tomorrow_m = () => tomorrow[_ + 'Month']();
    const tomorrow_y = () => tomorrow[_ + 'FullYear']();

    if (today_y() === y && today_m() === m && today_d() === d) {
        return short ? 'Tdy' : 'Today';
    }
    else if (yesterday_y() === y && yesterday_m() === m && yesterday_d() === d) {
        return short ? 'Ysd' : 'Yesterday';
    }
    else if (tomorrow_y() === y && tomorrow_m() === m && tomorrow_d() === d) {
        return short ? 'Tmw' : 'Tomorrow';
    }
    return dayName;
};

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 *
 * @param  {Date} `date`
 * @return {Number}
 */
const getWeek = (date) => {
    // Remove time components of date
    const targetThursday = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    // Change date to Thursday same week
    targetThursday.setDate(
        targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3
    );

    // Take January 4th as it is always in week 1 (see ISO 8601)
    const firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

    // Change date to Thursday same week
    firstThursday.setDate(
        firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3
    );

    // Check if daylight-saving-time-switch occurred and correct for it
    const ds =
        targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
    targetThursday.setHours(targetThursday.getHours() - ds);

    // Number of weeks between target Thursday and first Thursday
    const weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
    return 1 + Math.floor(weekDiff);
};

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 *
 * @param  {Date} `date`
 * @return {Number}
 */
const getDayOfWeek = (date) => {
    let dow = date.getDay();
    if (dow === 0) {
        dow = 7;
    }
    return dow;
};

/**
 * Get proper timezone abbreviation or timezone offset.
 * 
 * This will fall back to `GMT+xxxx` if it does not recognize the
 * timezone within the `timezone` RegEx above. Currently only common
 * American and Australian timezone abbreviations are supported.
 * 
 * @param  {String | Date} date
 * @return {String}
 */
const formatTimezone = (date) => {
    return (String(date).match(timezone) || [""])
        .pop()
        .replace(timezoneClip, "")
        .replace(/GMT\+0000/g, "UTC");
};
/*--------------------------------------------------------------------Date Picker Code Starts here----------------------------------------------------------*/
(function ($) {
    var defaults = {
        startYear: 50,
        noOfyears: 0,
        startDate: '01-Jan-2000',
        endDate: dateFormat(new Date(), 'dd-mmm-yyyy'),
        showTime: false,
        timeFormat: '24HR',//'12HR'
        ctrlId: '',
        format: 'dd-mmm-yyyy',//For now only dd-MMM-yyyy,dd/mm/yyyy,dd-mm-yyyy formats are supported
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], // Names of months for drop-down and formatting
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // For formatting
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // For formatting
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // For formatting
        dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Column headings for days starting at Sunday
        weekHeader: 'Wk', // Column header for week of the year
        holidays: [] || [''],
        disableddays: [] || []
    };
    var html = '<div id="dtModal" class="santPickerdp"><div class="santPickerdp-content"><table class="datepicker_tbl"><thead><tr><td><input type="hidden" id="hdnCtrlName"><select id="ddlMonth" class="dp-control calcender_ddl"><option value="">Month</option><option value="01">Jan</option><option value="02">Feb</option><option value="03">Mar</option><option value="04">Apr</option><option value="05">May</option><option value="06">Jun</option><option value="07">Jul</option><option value="08">Aug</option><option value="09">Sep</option><option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option></select></td><td><select id="ddlYear" class="dp-control calcender_ddl"></select></td><td><span id="btnclose" class="close_dp">X</span></td></tr><tr><td colspan="3"><table style="width:100%"><tr><td>S</td><td>M</td><td>T</td><td>W</td><td>T</td><td>F</td><td>S</td></tr></table></td></tr></thead><tbody><tr><td colspan="3"><div id="pnlMonths"></div></td></tr></tbody></table></div></div>';
    $.fn.santPicker = function (opts) {
        var settings = $.extend(defaults, opts || {});
        //debugger;
        settings.ctrlId = this[0].id;
        $('.santPicker').click(function () { $.fn.santPicker.functions.show(settings, this) });
        $('.santPicker').focus(function () { $.fn.santPicker.functions.show(settings, this) });
        $('span.seldt_dp').click(function () {

        });
        $('#dp_btnclose').click(function () {
            $('.santPickerdp').hide();
            $('.santPickerdp').remove();
        });

        $('#' + defaults.ctrlId).val(dateFormat(new Date(), settings.format));

        $('body').click(function (event) {
            if ($(event.target)[0].className.indexOf('santPicker') < 0 && $(event.target)[0].className.indexOf('calcender_ddl') < 0 && !$(event.target).is('#dtModal')) {
                $('.santPickerdp').hide();
                $('.santPickerdp').remove();
            }
        });
    };
    $.fn.santPicker.functions = {
        show: function (opts, ctrl) {
            //debugger;
            defaults.ctrlId = ctrl.id;
            var settings = $.extend(defaults, opts || {});
            $('.santPickerdp').remove();
            $('body').append(html);

            var offset = $("#" + settings.ctrlId).offset();
            var posY = offset.top - $(window).scrollTop();
            var posX = offset.left - $(window).scrollLeft();

            var element = document.getElementById(ctrl.id).getBoundingClientRect();

            $('.santPickerdp').css({ 'left': element.left + 'px', 'top': element.top + element.height + 'px', 'position': 'absolute' });
            $('.santPickerdp').show();

            $('.close_dp').click(function () { $.fn.santPicker.functions.hide(opts, ctrl); });


            var yearDiff = ($.fn.santPicker.functions.getYears(new Date(opts.startDate), new Date(opts.endDate))) + 1;//new Date().getFullYear() - settings.startYear;
            var start_year = new Date(opts.endDate).getFullYear();

            $('#ddlYear').append('<option value="">Select Year</option>');

            for (var i = start_year; i > start_year - yearDiff; i--) {
                if (i == new Date().getFullYear())
                    $('#ddlYear').append('<option selected="selected" value="' + i + '">' + i + '</option>');
                else
                    $('#ddlYear').append('<option value="' + i + '">' + i + '</option>');
            }

            $('#ddlMonth').val(("0" + String(new Date().getMonth() + 1)).slice(-2));
            $.fn.santPicker.functions.setDays(opts, ctrl);
            $('#ddlMonth').change(function () { $.fn.santPicker.functions.setDays(opts, ctrl); });
            $('#ddlYear').change(function () { $.fn.santPicker.functions.setDays(opts, ctrl); });

        },
        hide: function (opts, ctrl) {
            var settings = $.extend(defaults, opts || {});
            $('.santPickerdp').hide();
            $('.santPickerdp').remove();
        },
        setDate: function (day) {
            //debugger;
            if ($('#ddlMonth').val() == '' || $('#ddlYear').val() == '') {
                alert('Invalid Date!!');
            } else {
                var dtDate = ("0" + String(day)).slice(-2) + '-' + $('#ddlMonth option:selected').text() + '-' + $('#ddlYear').val();

                $('#' + defaults.ctrlId).val(dateFormat(dtDate, defaults.format));
            }
            $.fn.santPicker.functions.hide(defaults, defaults.ctrlId);
        },
        setDays: function (opts, ctrl) {
            //debugger;
            var settings = $.extend(defaults, opts || {});
            var days = $.fn.santPicker.functions.daysInMonth(parseInt($('#ddlMonth').val()), parseInt($('#ddlYear').val()));
            if (days > 0) {
                var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                var d = new Date(parseInt($('#ddlYear').val()), parseInt($('#ddlMonth').val()) - 1, 1);
                var monthStartOnDay = d.getDay();
                var day = weekday[monthStartOnDay];

                var trDay = '';
                $('#pnlMonths').html('');
                var table = '<table class="datepicker_tbl"><thead></thead><tbody>#DAYS#<tr><td colspan="6"></td></tr></tbody></table>';

                var countDay = 1;

                for (var r = 0; r < 6; r++) {
                    trDay += '<tr>';
                    for (var c = 0; c < 7; c++) {
                        if (r == 0 && c < monthStartOnDay) {
                            trDay += '<td></td>';
                        }
                        else {
                            if (countDay > days) {
                                trDay += '<td></td>';
                            }
                            else {
                                //For disabling the day in calander
                                try {
                                    var dtDate = new Date(("0" + String(countDay)).slice(-2) + '-' + $('#ddlMonth option:selected').text() + '-' + $('#ddlYear').val());

                                    var strDate = dateFormat(dtDate, 'dd-mmm').toUpperCase();

                                    if (opts.holidays != undefined && opts.holidays.indexOf(strDate) >= 0) {
                                        trDay += '<td><span class="seldt_dp_holiday" title="holiday">' + countDay + '</span></td>';

                                        countDay++;
                                        continue;
                                    }

                                    if (opts.disableddays != undefined && opts.disableddays.indexOf(dtDate.getDay()) >= 0) {
                                        trDay += '<td><span class="seldt_dp_disabled"  title="day disabled">' + countDay + '</span></td>';
                                    }
                                    else
                                        trDay += '<td><span class="seldt_dp" onclick="$.fn.santPicker.functions.setDate(' + countDay + ');">' + countDay + '</span></td>';
                                } catch (e) {
                                    trDay += '<td><span class="seldt_dp" onclick="$.fn.santPicker.functions.setDate(' + countDay + ');">' + countDay + '</span></td>';
                                }

                                countDay++;
                            }
                        }
                    }
                    trDay += '</tr>';
                    if (countDay >= days)
                        break;
                }
                //debugger;
                table = table.replace('#DAYS#', trDay);

                $('#pnlMonths').append(table);
            }
        },
        // Month in JavaScript is 0-indexed (January is 0, February is 1, etc), 
        // but by using 0 as the day it will give us the last day of the prior
        // month. So passing in 1 as the month number will return the last day
        // of January, not February
        daysInMonth: function (month, year) {
            return new Date(year, month, 0).getDate();
        },
        getYears: function (birthDate, ageAtDate) {
            // convert birthDate to date object if already not
            if (Object.prototype.toString.call(birthDate) !== '[object Date]')
                birthDate = new Date(birthDate);

            // use today's date if ageAtDate is not provided
            if (typeof ageAtDate == "undefined")
                ageAtDate = new Date();

            // convert ageAtDate to date object if already not
            else if (Object.prototype.toString.call(ageAtDate) !== '[object Date]')
                ageAtDate = new Date(ageAtDate);

            // if conversion to date object fails return null
            if (ageAtDate == null || birthDate == null)
                return null;


            var _m = ageAtDate.getMonth() - birthDate.getMonth();

            // answer: ageAt year minus birth year less one (1) if month and day of
            // ageAt year is before month and day of birth year
            return (ageAtDate.getFullYear()) - birthDate.getFullYear()
                - ((_m < 0 || (_m === 0 && ageAtDate.getDate() < birthDate.getDate())) ? 1 : 0)
        }
    };

}(jQuery));
