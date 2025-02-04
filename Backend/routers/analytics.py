
"""http://127.0.0.1:8000/vacancies/table/?filters=salary_to>=50000;min_experience<or:1#6;title=or:Аналитик данных#Data Scientist

"""

"""http://127.0.0.1:8000/vacancies/table_groupby/?group_by=address,experience&
aggregate=salary_to:AVG&
having=AVG(salary_to)>100000
"""

"""
http://127.0.0.1:8000/vacancies/table_main/?group_by=experience&
aggregate=salary_to:AVG
"""

"""
http://127.0.0.1:8000/vacancies/table_main/?limit=5
"""

"""http://127.0.0.1:8000/vacancies/table_main/?title=аналитик&
experience=От%203%20до%206%20лет&
type_of_employment=Полная%20занятость&
work_format=Удаленная%20работа& 
published_after=2024-01-01&
published_before=2024-12-31&
archived=false&
min_experience=3&
max_experience=6&
bonus=false
"""

"""
http://127.0.0.1:8000/resume/table/?title=analyst&min_age=25&max_age=35&currency=RUR&sort_by=age:desc&limit=10&not_null=salary,language_zho

"""