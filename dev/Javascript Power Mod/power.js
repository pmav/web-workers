
function power(a, b, c) {

    if (b == 0) {
        return 1;
    }

    var i = 0, total = a;
    b--;

    for (i = 0; i < b; i++) {
        total = (total * a) % c;
    }

    return total;
}


function powerDivision(p, n) {
    var e = 0, i = 0, d = 0;
    var a = [];

    e = Math.floor(p/n);

    for (i = 0 ; i < n; i++) {
        a[i] = e;
    }

    if ((e * n) < p) {
        d = p - (e * n);
        for (i = 0 ; i < d; i++) {
            a[i] += 1;
        }
    }

    return a;
}

// Notes: power(2, 500000000, 466)

function test() {
    var body = "";

    //var start = new Date();
    //body += ((power(2, 513, 466)*power(2, 513, 466)) % 466)+"<br>";
    //body += power(2, 1026, 466)+"<br>";

    body += powerDivision(1024, 10);


    //body += (new Date()) - start;

    document.body.innerHTML = body;
}