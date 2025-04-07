from datetime import timedelta

def generate_date_list(start_date, end_date, step_days=2):
    dates = []
    current_date = start_date
    while current_date < end_date:
        dates.append(current_date.strftime('%Y-%m-%d'))
        current_date += timedelta(days=step_days)
    dates.append(end_date.strftime('%Y-%m-%d'))
    return dates