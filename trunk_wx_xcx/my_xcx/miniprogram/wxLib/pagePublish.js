module.exports = {
    inputChange(e) {
        let id = e.target.id,
            val = e.detail.value,
            newObj = {};

        val = val.trim();
        newObj[id] = val;

        //this 指向page对象
        this.setData(newObj);
    }
};