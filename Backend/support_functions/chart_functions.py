import collections
import statistics


def aggregate_with_count(arr, aggregate):
    if not arr:
        return None, 0
    counts = collections.Counter(arr)
    if aggregate == "mode":
        max_count = max(counts.values())
        aggregate_value = next(k for k, v in counts.items() if v == max_count)
    elif aggregate == "max":
        aggregate_value = max(counts.keys())
        max_count = next(v for k, v in counts.items() if k == aggregate_value)
    elif aggregate == "min":
        aggregate_value = min(counts.keys())
        max_count = next(v for k, v in counts.items() if k == aggregate_value)
    else:
        return None, 0

    return aggregate_value, max_count


array_aggregate_funcs = {
    "avg": lambda arr: sum(arr) / len(arr) if arr else None,
    "sum": lambda arr: sum(arr),
    "max": lambda arr: aggregate_with_count(arr, "max") if arr else (None, 0),  # И значение и количество
    "min": lambda arr: aggregate_with_count(arr, "min") if arr else (None, 0),  # И значение и количество
    "median": lambda arr: statistics.median(arr) if arr else None,
    "stddev": lambda arr: statistics.stdev(arr) if len(arr) > 1 else None,
    "variance": lambda arr: statistics.variance(arr) if len(arr) > 1 else None,
    "mode": lambda arr: aggregate_with_count(arr, "mode") if arr else (None, 0)  # И значение и количество
}


def get_data_for_time_distribution(result, column, time_column, aggregates):
    if len(result) == 0:
        return None
    current_month = result[0][time_column].month
    current_year = result[0][time_column].year
    labels = []  # [{1,2024},{2,2024}, ...]
    values = []  # [30000,33000,34000,...]
    count_values = []  # [101,127,105,]
    current_values = []
    for item in result:
        if current_month == item[time_column].month:
            if isinstance(item[column], list):
                current_values += item[column]
            else:
                current_values.append(item[column])
        else:
            labels.append({'year': current_year, 'month': current_month})
            current_month = item[time_column].month
            current_year = item[time_column].year
            if aggregates in ["mode", "max", "min"]:
                mode_count = array_aggregate_funcs[aggregates](current_values)
                values.append(mode_count[0])
                count_values.append(mode_count[1])
            else:
                count_values.append(len(current_values))
                values.append(array_aggregate_funcs[aggregates](current_values))
            current_values = []
    if current_values:
        labels.append({'year': current_year, 'month': current_month})
        if aggregates in ["mode", "max", "min"]:
            mode_count = array_aggregate_funcs[aggregates](current_values)
            values.append(mode_count[0])
            count_values.append(mode_count[1])
        else:
            count_values.append(len(current_values))
            values.append(array_aggregate_funcs[aggregates](current_values))
    return [labels, values, count_values]


def get_data_for_metric_distribution(result, column, number_range):
    if not result or number_range <= 0:
        return None, None
    ranges = []
    counts = [0] * number_range
    len_range = (result[-1][column] - result[0][column]) / number_range
    max_number = result[-1][column]
    min_number = result[0][column]
    min_value = result[0][column]
    for i in range(number_range):
        ranges.append({'min_value': round(min_value,2), 'max_value': round(min_value + len_range,2)})
        min_value += len_range
    for item in result:
        number = item[column]
        count_number = item[f'{column}_count']
        if number == max_number:
            # Особый случай для максимального числа
            bin_index = number_range - 1
        else:
            bin_index = int((number - min_number) / len_range)
        counts[bin_index] += count_number
    return ranges, counts

def get_data_for_metric_column(result, column, metric_column, aggregations):
    if not result:
        return None, None, None
    print(result)
    labels = []
    values = []
    count_values = []
    for item in result:
        labels.append(item[column])
        values.append(item[f'{metric_column}_{aggregations}'])
        count_values.append(item[f'{column}_count'])
    return labels,values,count_values

def is_number(value):
    if isinstance(value, (int, float)):
        return True
    elif isinstance(value, str):
        # Проверяем, можно ли строку преобразовать в число
        try:
            float(value)  # Проверяем и целые, и дробные числа
            return True
        except ValueError:
            return False
    return False