#!/usr/bin/env python

import os,time
from flask import Flask, request, render_template, url_for
import pickle
import isoweek

savefile="/data/web/savefile.p"
savedata=[]
saveLastUpdate=os.path.getmtime(savefile)
sfmt = "%H:%M"
app = Flask(__name__)

def writeSavedata():

    savedata.sort()
    savedata.reverse()

    f = open(savefile, "wb")
    pickle.dump(savedata, f)
    f.close
    
def getSaveData():

    global savedata

    #only reload if the file has been modified by another process
    if os.path.getmtime(savefile) > saveLastUpdate:

        if os.path.isfile(savefile):
            f = open(savefile, "rb")
            savedata=pickle.load( f )
            f.close

        else:
            raise Exception("file '%s' not found"%savefile)

    return savedata

@app.route('/')
def getIndex():

    url_prefix = request.environ['SCRIPT_NAME']
    return render_template('table.html', ajax=False,
                    tbody=getTbody(), daystring="smtwtfs ", 
                    prefix=url_prefix)

@app.route('/table')
def getTable():
    return render_template('table.html', ajax=True,
                    tbody=getTbody(), daystring="smtwtfs ")


def getTbody():
    
    tbody = []
    lastWeek=-1
    hourSum=0.
    sd = getSaveData()
    for i in range(len(sd)):
        entry = sd[i]
        hours="0"
        endtime=None
        predict=None

        #break table by week, add "smtw<t>f" indicator to each row
        week=1+int(time.strftime("%W", time.localtime(entry[0])))
        if lastWeek != week:
            if lastWeek != -1: #avoid first run
                tbody.append({"type":"weekfooter", "sum":hourSum})
                hourSum=0.

            start = isoweek.Week(time.localtime(entry[0]).tm_year, week-1).sunday()
            end = isoweek.Week(time.localtime(entry[0]).tm_year, week).saturday()
            tbody.append({"type":"weekheader", "week":week, 
                          "sum":hourSum,
                          "start":start.strftime("%B %d"),
                          "end"  :end.strftime("%B %d")})

                
        lastWeek = week


        #add time rows for each entry
        if entry[1]:
            hours = str(round(((entry[1] - entry[0])/3600.), 2))
            endtime = time.strftime(sfmt, time.localtime(entry[1]))
        else:
            endtime = "(" + time.strftime(sfmt, time.localtime(3600*8+entry[0])) + ")"
            predict = True

        dayidx = 1+int(time.strftime("%w", time.localtime(entry[0])))

        tbody.append({
            "type": "entry", 
            "idx" : i, 
            "day" : dayidx,
            "date": time.strftime("%x", time.localtime(entry[0])),
            "in"  : time.strftime(sfmt, time.localtime(entry[0])),
            "out" : endtime,
            "predict" : predict,
            "hours":hours
        })

        hourSum += float(hours)

    #calc final sum line.
    tbody.append({"type":"weekfooter", "sum":hourSum})
    #end calc

    return tbody

@app.route('/in')
def get_in():
    t = time.time()

    sd = getSaveData()
    if (len(sd) is 0) or not (sd[0][0] != None and sd[0][1] == None):
        sd.insert(0, [t,None])
        s = "Arrived at: %s"%(
                time.strftime(sfmt, time.localtime(t)))

        writeSavedata()
        return s

    else:
        return "Already In ;)"


@app.route('/out')
def get_out():
    sd = getSaveData() 
    t = time.time()
    sd[0][1] = t
    s = "Left at: %s"%(
            time.strftime(sfmt, time.localtime(t)))
    
    writeSavedata()

    return s

@app.route('/edit/<entry>/<key>/<value>')
def get_edit(entry, key, value):

    if (not entry) or (not value) or (not key):
        return "/edit/<entry>/[in|out]/<hour>:<minute>"

    else:
        sd = getSaveData()
        col = None
        if key.lower() == "in": col=0
        elif key.lower() == "out": col=1

        if not sd[int(entry)][int(col)]:
            oldtimest = time.localtime(sd[int(entry)][0])
        else:
            oldtimest = time.localtime(sd[int(entry)][int(col)])

        newtimest = time.strptime(("%d %d %d "%(
                                    oldtimest.tm_year,
                                    oldtimest.tm_mon,
                                    oldtimest.tm_mday)) + value, 
                            "%Y %m %d " + sfmt)

        newtime = time.mktime(newtimest)

        sd[int(entry)][int(col)] = newtime
        writeSavedata()

        return "edited row %s, %s to %f (%s)"%(entry, col,
                newtime, time.strftime(sfmt, time.localtime(newtime)) )

@app.route('/add/<d1>/<d2>')
def get_add(d1, d2):
    if (not d1) or (not d2):
        return "/add/<month>-<day>-<year> <hour>:<minute>/<month>-<day>-<year> <hour>:<minute>"

    else:
        sd = getSaveData()
        newstart = time.mktime(time.strptime(d1, "%m-%d-%Y %H:%M"))
        newend   = time.mktime(time.strptime(d2, "%m-%d-%Y %H:%M"))

        sd.insert(0, [newstart, newend])
        writeSavedata()

        return "Added row."


@app.route('/delete/<entry>')
def get_delet(entry):
    if not entry:
        return "specify entry"

    sd = getSaveData()
    if len(sd) is not 0 and int(entry) < len(sd):
        sd.pop(int(entry))
        writeSavedata()
        return "Removed entry %d"%(int(entry))

    else:
        return "Empty already.."


if __name__ == '__main__':

    app.run(host='0.0.0.0', port=8080, use_reloader=True, debug=True)


