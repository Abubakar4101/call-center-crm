const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Tenant = require('../models/Tenant');

async function register({ type, name, email, password, tenantName, role }) {
    let tenant = await Tenant.findOne({ name: tenantName });

    if (!tenant && type === 'tenant') {
        tenant = await Tenant.create({ name: tenantName });
    }
    if (!tenant) throw new Error('Tenant not found');

    const passwordHash = await bcrypt.hash(password, 10);

    if (type === 'tenant') {
        const existing = await User.findOne({ email, tenant: tenant._id });
        if (existing) throw new Error('User already exists');

        const user = await User.create({ name, email, passwordHash, tenant: tenant._id, role: role });
        const token = generateToken(user._id, tenant._id, 'tenant', 'admin');
        return { token, account: user, tenant };
    }

    if (type === 'staff') {
        const existing = await Staff.findOne({ email, tenant: tenant._id });
        if (existing) throw new Error('Staff already exists');

        const staff = await Staff.create({
            name,
            email,
            passwordHash,
            tenant: tenant._id,
            role: 'agent',
        });
        const token = generateToken(staff._id, tenant._id, type);
        return { token, account: staff, tenant };
    }

    throw new Error('Invalid type');
}

async function login({ role, email, password }) {
    let account;
    if (role == 'admin') {
        role = "tenant";
    }

    if (role === 'tenant') {
        account = await User.findOne({ email });
        if(account) account.role = 'admin';
    };
    if (role === 'staff') account = await Staff.findOne({ email, active: true });
    if (!account) throw new Error(`${role} account not found`);

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    let tenant = await Tenant.findOne({ _id: account.tenant })
    if (!tenant) {
        throw new Error('Tenant not found')
    }
    const token = generateToken(account._id, tenant._id, role);
    console.log(account);
    return { token, account };
}

function generateToken(id, tenantId, role) {
    return jwt.sign({ userId: id, tenantId: tenantId, role: role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { register, login };