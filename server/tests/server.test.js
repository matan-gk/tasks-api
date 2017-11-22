const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Task} = require('./../models/task');

beforeEach((done) => {
    Task.remove({}).then(() => done());
})

describe ('POST /tasks', () => {
    it('should create a new task', (done) => {
        var title = 'test task text 2';
        request(app)
        .post('/tasks')
        .send({title})
        .expect(200)
        .expect((res) => {
            expect(res.body.title).toBe(title);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Task.find().then((tasks) => {
                expect(tasks.length).toBe(1);
                expect(tasks[0].title).toBe(title);
                done();
            }).catch((e) => done(e));
        });
    });
});