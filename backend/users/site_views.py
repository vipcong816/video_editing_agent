import sqlite3
import pandas as pd
from django_echarts.entities import Copyright, Jumbotron
from django_echarts.starter import DJESite, SiteOpts
from pyecharts import options as opts
from pyecharts.charts import Bar

__all__ = ['site_obj']

# 创建站点对象
site_obj = DJESite(
    site_title='剪辑师管理系统设计与实现',
    opts=SiteOpts(list_layout='list', nav_shown_pages=['home', 'list', 'settings'], nav_top_fixed=False)
)

# 添加页面组件
site_obj.add_widgets(
    copyright_=Copyright(
        start_year=2025,
        powered_by='剪辑师管理系统设计与实现'
    ),
    jumbotron=Jumbotron(
        '剪辑师管理系统设计与实现',
        main_text='分析',
        small_text='智能大数据'
    )
)



@site_obj.register_chart(title='用户剪辑数量关系', catalog='用户剪辑数量关系', description='本图描述了评论分布', tags=['内容'])
def operator_material_chart():
    conn = sqlite3.connect('db.sqlite3')
    query = "SELECT username,content  from users_editrequest"
    df = pd.read_sql_query(query, conn)

    # 统计每个操作员的厂家操作数量
    operator_counts = df.groupby('username')['content'].count()
    conn.close()

    bar = (
        Bar()
        .add_xaxis(operator_counts.index.tolist())
        .add_yaxis('用户', operator_counts.tolist())
        .set_global_opts(
            title_opts=opts.TitleOpts(title="用户", subtitle="单位：个"),
            visualmap_opts=opts.VisualMapOpts(is_show=True, max_=50, min_=0)
        )
        .set_series_opts(
            markline_opts=opts.MarkLineOpts(
                data=[opts.MarkLineItem(y=20.8, name="用户")]
            )
        )
    )
    return bar
