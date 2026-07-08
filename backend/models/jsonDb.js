const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class JsonDb {
  constructor(collectionName) {
    this.filePath = path.join(dataDir, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    let items = this.read();
    
    // Apply filters
    if (query.$or) {
      items = items.filter(item => {
        return query.$or.some(q => {
          return Object.keys(q).every(key => {
            const val = q[key];
            if (val && typeof val === 'object' && val.$regex) {
              const regex = new RegExp(val.$regex, val.$options || '');
              return regex.test(item[key] || '');
            }
            return item[key] === val;
          });
        });
      });
    } else {
      for (const key of Object.keys(query)) {
        const val = query[key];
        items = items.filter(item => {
          if (val && typeof val === 'object' && val.$regex) {
            const regex = new RegExp(val.$regex, val.$options || '');
            return regex.test(item[key] || '');
          }
          return item[key] === val;
        });
      }
    }
    
    return items.map(item => this.wrap(item));
  }

  async findOne(query = {}) {
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    const items = this.read();
    const item = items.find(i => String(i._id) === String(id));
    return item ? this.wrap(item) : null;
  }

  async create(doc) {
    const items = this.read();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      ...doc
    };
    items.push(newDoc);
    this.write(items);
    return this.wrap(newDoc);
  }

  async insertMany(docs) {
    const items = this.read();
    const newDocs = docs.map(doc => ({
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      ...doc
    }));
    items.push(...newDocs);
    this.write(items);
    return newDocs.map(d => this.wrap(d));
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }

  async deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      this.write([]);
      return;
    }
    const items = this.read();
    const remaining = items.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
    this.write(remaining);
  }

  wrap(item) {
    if (!item) return null;
    const self = this;
    
    // Create base object to copy properties
    const wrapped = { ...item };
    
    // Add instance helper methods
    wrapped.save = async function() {
      const items = self.read();
      const index = items.findIndex(i => String(i._id) === String(wrapped._id));
      
      // Extract data fields without functions
      const dataToSave = {};
      Object.keys(this).forEach(key => {
        if (typeof this[key] !== 'function') {
          dataToSave[key] = this[key];
        }
      });

      if (index !== -1) {
        items[index] = { ...items[index], ...dataToSave };
        self.write(items);
      } else {
        items.push(dataToSave);
        self.write(items);
      }
      return this;
    };

    wrapped.deleteOne = async function() {
      const items = self.read();
      const remaining = items.filter(i => String(i._id) !== String(wrapped._id));
      self.write(remaining);
      return { deletedCount: 1 };
    };

    return wrapped;
  }
}

module.exports = JsonDb;
