import os,time
from flask import Flask, render_template, url_for
import pickle
#import cpickle as pickle #faster but bad to debug

savefile="./savefile.p"
savedata=[]
sfmt = "%H:%M"

app = Flask(__name__)

def writeSavedata():
    #TODO: Sort the data!
    #sortData()

    f = open(savefile, "wb")
    pickle.dump(savedata, f)
    f.close
    

@app.route('/')
def get_index():
    
    tbody =""
    lastDay=-1
    for i in range(len(savedata)):
        entry = savedata[i]
        hours="-"
        endtime="-"

        #add header row to table for each new day
        day=time.strftime("%A", time.localtime(entry[0]))
        if lastDay != day:
            tbody += "<tr><th colspan='3'>%s</th><tr>\n"%day
        lastDay = day


        #add time rows for each entry
        if entry[1]:
            hours = str(round(((entry[1] - entry[0])/3600.), 2))
            endtime = time.strftime(sfmt, time.localtime(entry[1]))

        tbody += ("<tr title='entry %d' entry='%d'>" + \
        "<td class='in' contenteditable='true' data=\"%s\">%s</td>" + \
        "<td class='out' contenteditable='true' data=\"%s\">%s</td>" + \
        "<td class='hours'>%s</td></tr>\n")%(
                i, i,
                time.strftime(sfmt, time.localtime(entry[0])),
                time.strftime(sfmt, time.localtime(entry[0])),
                endtime,
                endtime,
                hours
                )
    return render_template('table.html', tbody=tbody) 

@app.route('/in')
def get_in():
    t = time.time()

    if savedata[-1][0] != None and savedata[-1][1] == None:
        return "Already In ;)"

    else:
        savedata.append([t,None])
        s = "Arrived at: %s"%(
                time.strftime(sfmt, time.localtime(t)))

        writeSavedata()
        return s




@app.route('/out')
def get_out():
    t = time.time()
    savedata[-1][1] = t
    s = "Left at: %s"%(
            time.strftime(sfmt, time.localtime(t)))
    
    writeSavedata()

    return s

@app.route('/edit/<entry>/<key>/<value>')
def get_edit(entry, key, value):

    if (not entry) or (not value) or (not key):
        return "/edit/<entry>/[in|out]/<hour>:<minute>"

    else:
        row = None
        if key.lower() == "in": row=0
        elif key.lower() == "out": row=1

        oldtimest = time.localtime(savedata[int(entry)][int(row)])
        newtimest = time.strptime(("%d %d %d "%(
                                    oldtimest.tm_year,
                                    oldtimest.tm_mon,
                                    oldtimest.tm_mday)) + value, 
                            "%Y %m %d " + sfmt)

        newtime = time.mktime(newtimest)

        savedata[int(entry)][int(row)] = newtime
        writeSavedata()

        return "edited row %s, %s to %f (%s)"%(entry, row,
                newtime, time.strftime(sfmt, time.localtime(newtime)) )

if __name__ == '__main__':

    if os.path.isfile(savefile):
        f = open(savefile, "rb")
        savedata=pickle.load( f )
        f.close

    app.run(host='0.0.0.0', debug=True)


