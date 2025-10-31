import sqlite3

conn = sqlite3.connect('test.db')



c = conn.cursor()
c.execute('''CREATE TABLE knowledge
       (
    QK          TEXT    NOT NULL,
       AK           TEXT     NOT NULL);''')
print ("数据表创建成功")
conn.commit()
conn.close()









conn = sqlite3.connect('test.db')
c = conn.cursor()
print ("数据库打开成功")

c.execute("INSERT INTO knowledge (QK,AK) \
      VALUES ('弹性云服务器的价格怎么计算的？', '我们有按需、包年/包月两种计费方式，您可以根据您的实际情况选择不同的计费方式。')")

conn.commit()
print ("数据插入成功")
conn.close()







conn = sqlite3.connect('test.db')
c = conn.cursor()
print ("数据库打开成功")

cursor = c.execute("SELECT QK,AK  from knowledge")
for row in cursor:
   print (row[0])
   print (row[1])



#c.execute("DELETE from COMPANY where QK='';")
#conn.commit()



print ("数据操作成功")
conn.close()











f = open("GP.html","r",encoding='utf-8')
html = f.read()
qawenben=html.split('\n')

conn = sqlite3.connect('test.db')
c = conn.cursor()
print ("数据库打开成功")

c.execute("insert into knowledge (QK,AK)  values ('{}','{}')".format(qawenben[0] ,qawenben[1]))

conn.commit()
print ("数据插入成功")
conn.close()
