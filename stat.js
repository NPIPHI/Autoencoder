class Set{
    constructor(data){
        this.data = data;
        this.dimensions = data[0].length;
        let m = [];
        for(let dim = 0; dim < this.dimensions; dim++){
            m.push(0);
        }
        this.data.forEach(d =>{
            for(let i = 0; i < d.length; i++){
                m[i]+=d[i];
            }
        });
        this.mean = new Vector(m);
        this.mean.scale(1/(this.data.length));
    }
    static fromArray(input){//[[1,3,2,4,1],[1,2,4,1,5]]
        let data= [];
        input.forEach(d=>{
            data.push(new Vector(d));
        })
        return new Set(data);
    }
    addElement(vect){
        this.mean.scale(this.data.length);
        this.data.push(vect);
        this.mean = this.mean.sum(vect);
        this.mean.scale(1/this.data.length);
    }
    meanNormalised(){
        let newPts = [];
        this.data.forEach(d=>{
            newPts.push(d.diffrence(this.mean));
        })
        return new Set(newPts); 
    }
    magnitudeNormalised(){
        let newPts = [];
        this.data.forEach(d=>{
            newPts.push(d.normalised);
        })
        return new Set(newPts);
    }
    covariance(index1,index2){
        let co = 0;
        this.data.forEach(d=>{
            co += (d[index1]-this.mean[index1])*(d[index2]-this.mean[index2]);
        })
        return co/(this.data.length);
    }
    getCovarianceMatrix(){
        let mat = [];
        if(this.covarianceMatrix){
            return this.covarianceMatrix;
        } else {
            for(let dim1 = 0; dim1 < this.dimensions; dim1++){
                mat.push([])
                for(let dim2 = 0; dim2 < this.dimensions; dim2++){
                    if(dim2>=dim1){
                        mat[dim1].push(this.covariance(dim1,dim2));
                    } else {
                        mat[dim1].push(mat[dim2][dim1]);
                    }
                }
            }
        }
        this.covarianceMatrix = new Matrix(mat);
        return this.covarianceMatrix;
    }
}
class Vector extends Float32Array{
    constructor(elements){
        super(elements);
    }
    scale(scaleFactor){
        for(let i = 0; i < this.length; i++){
            this[i]*=scaleFactor;
        }
    }
    diffrence(vect){
        let ret = [];
        for(let i = 0; i < this.length; i ++){
            ret[i] = this[i]-vect[i];
        }
        return new Vector(ret);
    }
    sum(vect){
        let ret = [];
        for(let i = 0; i < this.length; i++){
            ret[i] = this[i]+vect[i];
        }
        return new Vector(ret);
    }
    normalised(){
        let mag = 0;
        let newV = [];
        this.forEach(e=>{
            mag+=e*e;
            newV.push(e);
        });
        mag = Math.sqrt(mag);
        newV = new Vector(newV);
        newV.scale(1/mag);
    }
}
class Matrix{
    constructor(elements){//[[],[]]
        this.elements = [];
        this.rows = elements.length;
        this.coloums = elements[0].length;
        elements.forEach(e=>{
            this.elements.push(new Float32Array(e));
        });
    }
    getEigenvectors(){
        let eigenVectors = Matrix.identity(this.rows);
        let buf = Matrix.identity(this.rows);
        let eigenValues = this;
        for(let reps = 0; reps < (this.rows*(this.rows-1)); reps ++){
            let error = eigenValues.getMaxErr();
            buf = Matrix.identity(eigenValues.rows);
            let trans = eigenValues.getSubDecomposition(error.i,error.j);
            buf.elements[error.i][error.j] = trans.elements[0][1];
            buf.elements[error.j][error.i] = trans.elements[1][0];
            buf.elements[error.i][error.i] = trans.elements[0][0];
            buf.elements[error.j][error.j] = trans.elements[1][1]; 
            eigenVectors = eigenVectors.multiplyMat(buf);
            eigenValues = buf.transpose().multiplyMat(eigenValues).multiplyMat(buf);
        }
        return {eigVects: eigenVectors, eigValues: eigenValues};//coloumns are eigenvectors
    }
    sumOfSquares(){
        let val = 0;
        for(let i = 0; i < this.rows; i ++){
            for(let j = 0; j < this.coloums; j++){
                val += this.elements[i][j]*this.elements[i][j];
            }
        }
        return val;
    }
    static getRandomBigMatrix(bigness){
        let ret = [];

        for(let i = 0; i < bigness; i++){
            ret.push([]);
            for(let j = 0; j <= i; j++){
                let a = Math.random()*10;
                ret[i][j] = a
                ret[j][i] = a;
            }
        }
        return new Matrix(ret);
    }
    getMaxErr(){
        let err = {i: 0, j: 0, error: 0}
        for(let i = 1; i < this.rows; i++){
            for(let j = 0; j < i; j++){
                if(Math.abs(this.elements[j][i])>err.error){
                    err.i = i;
                    err.j = j;
                    err.error = Math.abs(this.elements[j][i]);
                }
            }
        }
        return err;
    }
    multiplyMat(mat) {
        var result = [];
        for (var i = 0; i < this.rows; i++) {
            result[i] = [];
            for (var j = 0; j < mat.coloums; j++) {
                var sum = 0;
                for (var k = 0; k < this.coloums; k++) {
                    sum += this.elements[i][k] * mat.elements[k][j];
                }
                result[i][j] = sum;
            }
        }
        return new Matrix(result);
    }
    multiplyVect(vect){
        
    }
    getScale(scale){
        let ret = []
        this.elements.forEach(e=>{
            for(let i = 0; i < e.length; i++){
                ret[i] = e[i]*scale;
            }
        })
    }
    transpose(){
        let result = [];
        for(let i = 0; i < this.coloums; i++){
            result[i] = [];
            for(let j = 0; j < this.rows; j++){
                result[i][j]=this.elements[j][i];
            }
        }
        return new Matrix(result);
    }
    getSubDecomposition(p,q){
        if(p==q){
            throw "diag";
        }
        if(this.elements[q][p]==0){
            return new Matrix([[1,0],[0,1]]);
        }
        let T = (this.elements[q][q]-this.elements[p][p])/(2*this.elements[q][p]);
        let r1 = -T + Math.sqrt(1+T*T);
        let r2 = -T - Math.sqrt(1+T*T);
        let tan;
        if(Math.abs(r1)>Math.abs(r2)){
            tan = r2;
        } else {
            tan = r1;
        }
        let cos = 1/(Math.sqrt(1+tan*tan));
        let sin = cos*tan;
        return new Matrix([[cos,sin],[-sin,cos]]);
    }
    print(){
        this.elements.forEach(e=>{
            let str = "[";
            e.forEach(n=>{
                str = str+n;
                str = str+",";
            })
            str = str+"]";
            console.log(str);
        })
    }
    at(i,j){

    }
    static identity(rows){
        let result = [];
        for(let i = 0; i < rows; i++){
            result[i]=[];
            for(let j = 0; j < rows; j++){
                result[i][j] = (i==j)?1:0;
            }
        }
        return new Matrix(result);
    }
}